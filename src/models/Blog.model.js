import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  body: { type: String, required: true },
  
  author: { type: String }, // For simplicity, using string. Can be linked to AdminUser later
  editor: { type: String },
  reviewer: { type: String },
  
  tags: [{ type: String }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  related_products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Phone' }],
  related_brands: [{ type: String }],
  
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false },
  breaking: { type: Boolean, default: false },
  
  publish_date: { type: Date },
  schedule: { type: Date },
  
  seo: {
    meta_title: String,
    meta_description: String,
    keywords: String,
  }
}, { timestamps: true });

blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1 });

export const Blog = mongoose.model('Blog', blogSchema);
