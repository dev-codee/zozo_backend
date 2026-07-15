import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    logo: { type: String },
    description: { type: String }
}, { timestamps: true });

export const Brand = mongoose.model('Brand', brandSchema);
