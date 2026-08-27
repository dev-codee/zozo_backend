import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    logo: { type: String },
    description: { type: String },
    // Which vertical the brand belongs to. Legacy brands have no value and are
    // treated as 'phone' everywhere (see brand.service.js filters), so existing
    // phone-facing pages are unaffected.
    type: { type: String, enum: ['phone', 'ev'], default: 'phone', index: true },
}, { timestamps: true });

export const Brand = mongoose.model('Brand', brandSchema);
