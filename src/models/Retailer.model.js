import mongoose from 'mongoose';

const retailerSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    website_url: { type: String },
    logo: { type: String }
}, { timestamps: true });

export const Retailer = mongoose.model('Retailer', retailerSchema);
