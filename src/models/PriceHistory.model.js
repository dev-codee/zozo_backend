import mongoose from 'mongoose';

const priceHistorySchema = new mongoose.Schema({
    phone_slug: { type: String, required: true },
    retailer_slug: { type: String, required: true },
    price: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
}, { 
    timeseries: {
        timeField: 'timestamp',
        metaField: 'phone_slug',
        granularity: 'hours'
    }
});

// Compound index for query performance
priceHistorySchema.index({ phone_slug: 1, price: 1 });

export const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);
