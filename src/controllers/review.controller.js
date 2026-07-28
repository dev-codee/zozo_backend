import Review from '../models/Review.model.js';
import { Phone } from '../models/Phone.model.js';
import mongoose from 'mongoose';

// @desc    Get all reviews for a phone
// @route   GET /api/reviews/:phoneId
// @access  Public
export const getPhoneReviews = async (req, res, next) => {
  try {
    const { phoneId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(phoneId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone ID',
      });
    }

    const reviews = await Review.find({ phoneId })
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 reviews

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a review for a phone
// @route   POST /api/reviews
// @access  Public
export const createReview = async (req, res, next) => {
  try {
    const { phoneId, userName, rating, comment } = req.body;

    if (!phoneId || !userName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phoneId, userName, rating, and comment',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(phoneId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone ID',
      });
    }

    // Create the review
    const review = await Review.create({
      phoneId,
      userName,
      rating: Number(rating),
      comment
    });

    // Atomically recalculate average rating for the phone using MongoDB update pipeline (Handles high concurrency)
    await Phone.updateOne(
      { _id: new mongoose.Types.ObjectId(phoneId) },
      [
        {
          $set: {
            "rating.count": { $add: [{ $ifNull: ["$rating.count", 0] }, 1] },
            "rating.average": {
              $divide: [
                {
                  $add: [
                    { $multiply: [{ $ifNull: ["$rating.average", 0] }, { $ifNull: ["$rating.count", 0] }] },
                    Number(rating)
                  ]
                },
                { $add: [{ $ifNull: ["$rating.count", 0] }, 1] }
              ]
            }
          }
        }
      ]
    );

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};
