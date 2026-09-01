import VehicleReview from '../models/VehicleReview.model.js';
import { Vehicle } from '../models/Vehicle.model.js';
import mongoose from 'mongoose';

// @desc    Get all reviews for a vehicle
// @route   GET /api/vehicle-reviews/:vehicleId
// @access  Public
export const getVehicleReviews = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    }

    const reviews = await VehicleReview.find({ vehicleId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await VehicleReview.countDocuments({ vehicleId });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a review for a vehicle
// @route   POST /api/vehicle-reviews
// @access  Private (logged-in users)
export const createVehicleReview = async (req, res, next) => {
  try {
    const { vehicleId, rating, comment } = req.body;
    const userName = req.user?.name;
    const userId = req.user?._id;

    if (!vehicleId || !userName || !rating || !comment || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicleId, rating, comment, and ensure you are logged in.',
      });
    }

    const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9.-]+\.(com|org|net|pk|co|us|io|me)(\/[^\s]*)?)/i;
    if (linkRegex.test(comment)) {
      return res.status(400).json({ success: false, message: 'Links are not allowed in the review comment' });
    }

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    }

    const existingReview = await VehicleReview.findOne({ vehicleId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this vehicle',
      });
    }

    const review = await VehicleReview.create({
      vehicleId,
      userId,
      userName,
      rating: Number(rating),
      comment,
    });

    // Atomically recalculate the vehicle's average rating.
    await Vehicle.updateOne(
      { _id: new mongoose.Types.ObjectId(vehicleId) },
      [
        {
          $set: {
            'rating.count': { $add: [{ $ifNull: ['$rating.count', 0] }, 1] },
            'rating.average': {
              $divide: [
                {
                  $add: [
                    { $multiply: [{ $ifNull: ['$rating.average', 0] }, { $ifNull: ['$rating.count', 0] }] },
                    Number(rating),
                  ],
                },
                { $add: [{ $ifNull: ['$rating.count', 0] }, 1] },
              ],
            },
          },
        },
      ]
    );

    res.status(201).json({ success: true, data: review, message: 'Review submitted successfully' });
  } catch (error) {
    next(error);
  }
};
