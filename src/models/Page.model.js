import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  body: { type: String, required: true },
  
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
  
  seo: {
    meta_title: String,
    meta_description: String,
    keywords: String,
  }
}, { timestamps: true });

pageSchema.index({ slug: 1 });

export const Page = mongoose.model('Page', pageSchema);
