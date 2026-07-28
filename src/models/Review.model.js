import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  phoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phone',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  }
}, { timestamps: true });

// Prevent same userName from submitting multiple reviews for the same phone (optional, but good for spam protection)
// Here we just allow multiple for now if it's purely anonymous. Or we can index by session if we had it.

const Review = mongoose.model('Review', reviewSchema);

export default Review;
