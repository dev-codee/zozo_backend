// Recursively strips placeholder "junk" values from a product payload before it
// is persisted.
//
// LLM extraction (and occasionally manual entry) can produce the *string*
// "null", "N/A", "-", "undefined", etc. for fields that have no verified value.
// These strings are truthy, so they survive to the frontend and render verbatim
// ("GPU Clock: null", "null Years", "null / null"). Per the data-quality policy,
// an unverified field must be genuinely empty — not a placeholder and never a
// guessed value — so the row can be hidden downstream.
//
// This normalizer runs on the write path so the database never stores junk:
//   - junk strings          -> null
//   - other strings         -> trimmed
//   - NaN                   -> null
//   - arrays                -> junk entries removed, then recursed
//   - objects               -> recursed
// Booleans, real numbers, dates and null/undefined pass through untouched.

const JUNK_STRINGS = new Set([
  '',
  'null',
  'undefined',
  'nan',
  'n/a',
  'na',
  '-',
  '--',
  'none specified',
  'not specified',
  'not available',
  'unknown',
]);

export const isJunkValue = (v) => {
  if (v === null || v === undefined) return true;
  if (typeof v === 'number') return Number.isNaN(v);
  if (typeof v === 'string') return JUNK_STRINGS.has(v.trim().toLowerCase());
  return false;
};

export const sanitizeSpecs = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return JUNK_STRINGS.has(trimmed.toLowerCase()) ? null : trimmed;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeSpecs(item))
      .filter((item) => !isJunkValue(item));
  }

  // Preserve Date and other non-plain objects as-is; only recurse into plain
  // objects (the shape used for specs / extra_specs trees).
  if (value && typeof value === 'object' && value.constructor === Object) {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = sanitizeSpecs(val);
    }
    return out;
  }

  return value;
};
