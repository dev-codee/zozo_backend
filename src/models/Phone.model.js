import mongoose from 'mongoose';

const phoneSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand_slug: { type: String, required: true },
    specs: {
        display: { type: Object },
        performance: { type: Object },
        camera: { type: Object },
        battery: { type: Object },
        body: { type: Object },
        connectivity: { type: Object }
    },
    images: [{ type: String }],
    prices: [{
        retailer_slug: String,
        price: Number,
        url: String,
        updated_at: Date
    }],
    pta_tax: { type: Object },
    rating: { type: Object },
    sources: [{ type: String }],
    is_published: { type: Boolean, default: false }
}, { timestamps: true });

phoneSchema.index({ name: 'text' });
phoneSchema.index({ 'prices.price': 1 }); // Index for price filtering

export const Phone = mongoose.model('Phone', phoneSchema);
