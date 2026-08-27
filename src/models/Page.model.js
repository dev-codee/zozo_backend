import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  body: { type: String, required: true },
  
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
  
  pageType: { type: String, enum: ['STANDALONE', 'PARENT', 'CHILD'], default: 'STANDALONE' },
  placement: { type: String, enum: ['HEADER', 'FOOTER', 'BOTH', 'NONE'], default: 'NONE' },
  parentPage: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', default: null },

  seo: {
    meta_title: String,
    meta_description: String,
    keywords: String,
  }
}, { timestamps: true });

// (slug is already indexed via unique: true)

export const Page = mongoose.model('Page', pageSchema);
