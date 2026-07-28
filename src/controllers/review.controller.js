import Review from '../models/Review.model.js';
import { Phone } from '../models/Phone.model.js';
import mongoose from 'mongoose';

// @desc    Get all reviews for a phone
// @route   GET /api/reviews/:phoneId
// @access  Public
export const getPhoneReviews = async (req, res, next) => {
  try {
    const { phoneId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(phoneId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone ID',
      });
    }

    const reviews = await Review.find({ phoneId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ phoneId });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
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
    const { phoneId, rating, comment } = req.body;
    const userName = req.user?.name;
    const userId = req.user?._id;

    if (!phoneId || !userName || !rating || !comment || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phoneId, rating, comment, and ensure you are logged in.',
      });
    }

    const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9.-]+\.(com|org|net|pk|co|us|io|me)(\/[^\s]*)?)/i;
    if (linkRegex.test(comment)) {
      return res.status(400).json({
        success: false,
        message: 'Links are not allowed in the review comment',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(phoneId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone ID',
      });
    }

    // Check if user already reviewed this phone
    const existingReview = await Review.findOne({ phoneId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this phone',
      });
    }

    // Create the review
    const review = await Review.create({
      phoneId,
      userId,
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
