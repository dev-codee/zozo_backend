import mongoose from 'mongoose';

const scrapeLogSchema = new mongoose.Schema({
    retailer_slug: { type: String, required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED'] },
    items_scraped: { type: Number },
    error_message: { type: String }
}, { timestamps: true });

export const ScrapeLog = mongoose.model('ScrapeLog', scrapeLogSchema);
