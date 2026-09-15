/**
 * One-time cleanup: strip placeholder "junk" values from existing records.
 *
 * Historic documents were saved before the write-path sanitizer existed, so
 * their spec trees can still contain the string "null" (and "N/A", "-", …) that
 * renders verbatim on the site ("GPU Clock: null", "null Years", "null / null").
 *
 * This walks every Phone, Vehicle and Earbud, runs the same sanitizeSpecs()
 * used on write, and saves back ONLY when something actually changed. It never
 * invents or backfills values — junk simply becomes null (numbers/strings) or is
 * dropped (array entries), so downstream rows hide instead of printing garbage.
 *
 * Usage:
 *   node src/scripts/cleanSpecJunk.js --dry-run   # report only, writes nothing
 *   node src/scripts/cleanSpecJunk.js             # apply changes
 */
import env from '../config/env.js';
import mongoose from 'mongoose';
import { Phone } from '../models/Phone.model.js';
import { Vehicle } from '../models/Vehicle.model.js';
import { Earbud } from '../models/Earbud.model.js';
import { sanitizeSpecs } from '../utils/sanitizeSpecs.js';

const DRY_RUN = process.argv.includes('--dry-run');

const cleanCollection = async (Model, label) => {
  const docs = await Model.find({ specs: { $exists: true } }).select('_id name slug specs');
  let changed = 0;

  for (const doc of docs) {
    // doc.specs is a Mongoose subdocument, not a plain object — convert first
    // so sanitizeSpecs recurses into it (it only walks plain objects).
    const plain = doc.toObject().specs;
    const before = JSON.stringify(plain);
    const after = sanitizeSpecs(plain);
    const afterStr = JSON.stringify(after);
    if (before === afterStr) continue;

    changed += 1;
    console.log(`  [${label}] ${doc.slug || doc.name || doc._id} — cleaned`);
    if (!DRY_RUN) {
      // Assign the sanitized tree and persist just the specs field.
      doc.specs = after;
      doc.markModified('specs');
      await doc.save({ validateBeforeSave: false });
    }
  }

  console.log(`[${label}] ${changed}/${docs.length} record(s) ${DRY_RUN ? 'would be' : 'were'} cleaned.`);
  return changed;
};

const run = async () => {
  if (!env.MONGODB_URI) {
    console.error('MONGODB_URI is not set.');
    process.exit(1);
  }

  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected. ${DRY_RUN ? 'DRY RUN — no writes.' : 'Applying changes.'}\n`);

  let total = 0;
  total += await cleanCollection(Phone, 'phone');
  total += await cleanCollection(Vehicle, 'vehicle');
  total += await cleanCollection(Earbud, 'earbud');

  console.log(`\nDone. ${total} record(s) ${DRY_RUN ? 'would be' : 'were'} updated.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('Cleanup failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
