/**
 * Bulk spec corrector.
 *
 * For each phone in the chosen brands, re-runs the SAME web-grounded generator
 * the admin "Generate with AI" button uses (generatePhoneDataAdmin -> Perplexity
 * live search, GSMArena as source of truth), and writes back ONLY `specs`.
 * Descriptions, SEO, prices, images and tags are never touched.
 *
 * Safety:
 *   - Merge rule: a new confirmed value overwrites the old one, but if the
 *     generator returns null/empty (it couldn't confirm), the old value is kept.
 *     So it corrects values without ever blanking existing data.
 *   - Before every write it stores a PhoneRevision snapshot of the previous doc,
 *     so any phone can be rolled back exactly like an admin edit.
 *   - --dry-run writes nothing; it produces a before/after diff report only.
 *   - Processed phone ids are logged so a re-run resumes where it left off.
 *
 * Usage:
 *   node src/scripts/regenPhoneSpecs.js --dry-run --sample=5
 *   node src/scripts/regenPhoneSpecs.js --brands=samsung,vivo,apple,google
 *   node src/scripts/regenPhoneSpecs.js            # full major-brand run
 */
import env from '../config/env.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Phone } from '../models/Phone.model.js';
import { PhoneRevision } from '../models/PhoneRevision.model.js';
import { generatePhoneDataAdmin } from '../services/ai.service.js';

// ─── Config ──────────────────────────────────────────────────────────────────
const MAJOR_BRANDS = ['samsung', 'vivo', 'apple', 'google', 'xiaomi', 'oppo', 'oneplus', 'realme', 'nothing', 'honor', 'motorola'];
const SYSTEM_ADMIN_ID = '6a61078988bf1cb694658f97'; // SUPER_ADMIN, for revision attribution
const PROGRESS_FILE = path.resolve('specs_regen_progress.json');
const REPORT_FILE = path.resolve('specs_review.json');

// ─── Args ────────────────────────────────────────────────────────────────────
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
}));
const DRY_RUN = !!args['dry-run'];
const SAMPLE = args.sample ? parseInt(args.sample, 10) : null;
const LIMIT = args.limit ? parseInt(args.limit, 10) : null;
const CONCURRENCY = args.concurrency ? parseInt(args.concurrency, 10) : (DRY_RUN ? 1 : 3);
// --brands=all (or --all) => every phone in the DB; otherwise a brand list.
const ALL_BRANDS = args.all || String(args.brands).toLowerCase() === 'all';
const BRANDS = ALL_BRANDS ? null : (args.brands ? String(args.brands).split(',').map((s) => s.trim().toLowerCase()) : MAJOR_BRANDS);
// --replace => the generated specs fully REPLACE the old specs subtree (old spec
// values are discarded). Without it, we deep-merge and keep old values the
// generator couldn't confirm. Either way, ONLY `specs` is written.
const REPLACE = !!args.replace;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
const isEmpty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0) || (typeof v === 'number' && Number.isNaN(v));

/**
 * Deep-merge: a new confirmed value wins, but never degrades existing data.
 *  - object -> recurse
 *  - boolean -> presence is sticky: true (from either side) wins. A new `false`
 *    is treated as "unconfirmed" (the schema default) and never flips an old
 *    `true`. This prevents the generator's unpopulated sensor/nfc/charging flags
 *    from wiping correct `true` values.
 *  - scalar/array -> new wins only when non-empty; empty new keeps old.
 */
function mergeSpecs(oldObj = {}, newObj = {}) {
    const out = isPlainObject(oldObj) ? { ...oldObj } : {};
    for (const [k, nv] of Object.entries(newObj || {})) {
        const ov = out[k];
        if (isPlainObject(nv) && isPlainObject(ov)) out[k] = mergeSpecs(ov, nv);
        else if (isPlainObject(nv)) out[k] = mergeSpecs({}, nv);
        else if (typeof nv === 'boolean' || typeof ov === 'boolean') out[k] = Boolean(ov) || Boolean(nv);
        else if (isEmpty(nv)) { /* keep old */ }
        else out[k] = nv;
    }
    return out;
}

/** Flatten leaves to dot-paths for diffing. */
function flatten(obj, prefix = '', acc = {}) {
    if (isPlainObject(obj)) {
        for (const [k, v] of Object.entries(obj)) flatten(v, prefix ? `${prefix}.${k}` : k, acc);
    } else {
        acc[prefix] = Array.isArray(obj) ? JSON.stringify(obj) : obj;
    }
    return acc;
}

function diffSpecs(oldSpecs, mergedSpecs) {
    const a = flatten(oldSpecs || {});
    const b = flatten(mergedSpecs || {});
    const changes = [];
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
        const before = a[key];
        const after = b[key];
        if (JSON.stringify(before) !== JSON.stringify(after)) {
            changes.push({ field: key, before: before ?? null, after: after ?? null });
        }
    }
    return changes;
}

// Paths are relative to the specs object (that is what gets flattened/diffed).
const CRITICAL = ['battery.capacity_mah', 'battery.charging_watts', 'performance.chipset',
    'display.size_inches', 'display.refresh_rate_hz', 'display.peak_brightness_nits',
    'body.weight_g', 'camera.rear_summary', 'os'];

function loadJson(f, fallback) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; } }
function saveJson(f, data) { fs.writeFileSync(f, JSON.stringify(data, null, 2)); }

const normBrand = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Physically-plausible ranges for numeric specs. A generated value outside its
// range is almost certainly a hallucination or a wrong-variant carry-over, so we
// discard it (set null -> merge keeps the old value) rather than writing garbage.
const RANGES = {
    'display.size_inches': [3, 15],
    'display.refresh_rate_hz': [24, 480],
    'display.peak_brightness_nits': [50, 12000],
    'battery.capacity_mah': [300, 15000],
    'battery.charging_watts': [1, 400],
    'body.height_mm': [80, 240],
    'body.width_mm': [40, 180], // upper end covers unfolded foldables (~145-160mm)
    'body.thickness_mm': [3, 30],
    'body.weight_g': [60, 500],
};
const ARRAY_RANGES = {
    'performance.ram_options_gb': [1, 64],
    'performance.storage_options_gb': [4, 4096],
};

/** Null-out or trim any generated numeric spec that is out of physical range.
 *  Mutates `specs` in place; returns a list of human-readable warnings. */
function sanitizeRanges(specs) {
    const warnings = [];
    const get = (o, p) => p.split('.').reduce((x, k) => (x == null ? x : x[k]), o);
    const set = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((x, k) => (x == null ? x : x[k]), o); if (t) t[last] = v; };
    for (const [path, [lo, hi]] of Object.entries(RANGES)) {
        const v = get(specs, path);
        if (typeof v === 'number' && (v < lo || v > hi)) { set(specs, path, null); warnings.push(`${path}=${v} out of [${lo},${hi}] → dropped`); }
    }
    for (const [path, [lo, hi]] of Object.entries(ARRAY_RANGES)) {
        const v = get(specs, path);
        if (Array.isArray(v)) {
            const kept = v.filter((n) => typeof n === 'number' && n >= lo && n <= hi);
            if (kept.length !== v.length) { set(specs, path, kept.length ? kept : null); warnings.push(`${path}=${JSON.stringify(v)} had out-of-range values → ${JSON.stringify(kept)}`); }
        }
    }
    return warnings;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function run() {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(`Connected. mode=${DRY_RUN ? 'DRY-RUN' : 'WRITE'} specs=${REPLACE ? 'REPLACE' : 'MERGE'} brands=${ALL_BRANDS ? 'ALL' : `[${BRANDS.join(', ')}]`} concurrency=${CONCURRENCY}`);

    const progress = DRY_RUN ? { done: [] } : loadJson(PROGRESS_FILE, { done: [] });
    const doneSet = new Set(progress.done);

    const filter = ALL_BRANDS ? {} : { brand_slug: { $in: BRANDS } };
    if (args.released) { // only phones actually out — real specs to verify against
        filter.release_date = { $lte: new Date() };
        filter.status = { $in: ['released', 'available', 'discontinued', 'out_of_stock'] };
    }
    let query = Phone.find(filter);
    if (SAMPLE) query = query.sort({ release_date: -1 }); // newest = easiest to eyeball
    let phones = await query.exec();
    phones = phones.filter((p) => !doneSet.has(p._id.toString()));
    if (SAMPLE) phones = phones.slice(0, SAMPLE);
    if (LIMIT) phones = phones.slice(0, LIMIT);

    console.log(`Processing ${phones.length} phone(s)${doneSet.size ? ` (${doneSet.size} already done, skipped)` : ''}.\n`);

    const report = [];
    const flagged = [];
    let ok = 0, failed = 0, changedCount = 0, skipped = 0;
    const existingReport = DRY_RUN ? [] : loadJson(REPORT_FILE, []);

    let idx = 0;
    async function worker() {
        while (idx < phones.length) {
            const i = idx++;
            const phone = phones[i];
            const label = `[${i + 1}/${phones.length}] ${phone.name}`;
            try {
                const aiData = await generatePhoneDataAdmin(phone.name);
                if (!aiData || !aiData.specs) { console.warn(`  ✗ ${label}: no specs returned`); failed++; continue; }

                // GUARD 1 — wrong-phone protection. If the generator resolved a
                // different brand than the DB record, the whole result is untrusted;
                // skip the write and flag it for manual review instead of corrupting it.
                if (aiData.brand_slug && normBrand(aiData.brand_slug) !== normBrand(phone.brand_slug)) {
                    flagged.push({ id: phone._id.toString(), name: phone.name, brand: phone.brand_slug, reason: `BRAND_MISMATCH: generated '${aiData.brand_slug}'` });
                    console.warn(`  ⚠ ${label}: brand mismatch (got '${aiData.brand_slug}', expected '${phone.brand_slug}') — SKIPPED`);
                    skipped++;
                    continue;
                }

                // GUARD 2 — drop physically-impossible numeric values before merge.
                const rangeWarnings = sanitizeRanges(aiData.specs);

                const oldSpecs = phone.specs ? phone.specs.toObject?.() ?? phone.specs : {};
                // REPLACE: generated specs stand alone (old values discarded).
                // MERGE: keep old values the generator couldn't confirm.
                const merged = REPLACE ? aiData.specs : mergeSpecs(oldSpecs, aiData.specs);
                const changes = diffSpecs(oldSpecs, merged);
                const criticalChanges = changes.filter((c) => CRITICAL.includes(c.field));

                report.push({ id: phone._id.toString(), name: phone.name, brand: phone.brand_slug, totalChanges: changes.length, criticalChanges, changes });
                if (changes.length) changedCount++;
                if (rangeWarnings.length) flagged.push({ id: phone._id.toString(), name: phone.name, brand: phone.brand_slug, reason: 'RANGE', warnings: rangeWarnings });

                const crit = criticalChanges.length
                    ? criticalChanges.map((c) => `${c.field.split('.').pop()} ${JSON.stringify(c.before)}→${JSON.stringify(c.after)}`).join(', ')
                    : 'no critical changes';
                console.log(`  ✓ ${label}: ${changes.length} change(s)${rangeWarnings.length ? ` [${rangeWarnings.length} range-drop]` : ''} | ${crit}`);

                if (!DRY_RUN) {
                    await PhoneRevision.create({
                        phoneId: phone._id,
                        changedBy: SYSTEM_ADMIN_ID,
                        action: 'UPDATED',
                        note: 'Bulk spec re-generation (specs-only, web-grounded)',
                        snapshot: phone.toObject(),
                    });
                    phone.specs = merged;
                    phone.updatedBy = SYSTEM_ADMIN_ID;
                    await phone.save();
                    progress.done.push(phone._id.toString());
                    saveJson(PROGRESS_FILE, progress);
                }
                ok++;
            } catch (e) {
                console.error(`  ✗ ${label}: ${e.message}`);
                failed++;
            }
        }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, phones.length) }, worker));

    saveJson(REPORT_FILE, DRY_RUN ? report : [...existingReport, ...report]);
    const FLAGGED_FILE = path.resolve('specs_flagged.json');
    const existingFlagged = DRY_RUN ? [] : loadJson(FLAGGED_FILE, []);
    saveJson(FLAGGED_FILE, [...existingFlagged, ...flagged]);
    console.log(`\nDone. ok=${ok} failed=${failed} skipped(brand-mismatch)=${skipped} withChanges=${changedCount} flagged=${flagged.length}`);
    console.log(`Report:  ${REPORT_FILE}${DRY_RUN ? '  (DRY-RUN — nothing written to DB)' : ''}`);
    if (flagged.length) console.log(`Flagged: ${FLAGGED_FILE}  (review these — not trusted / partially dropped)`);
    await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
