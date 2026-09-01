import VehicleVote from '../models/VehicleVote.model.js';
import mongoose from 'mongoose';

// @desc    Cast a vote for a vehicle
// @route   POST /api/vehicle-votes
// @access  Public
export const castVote = async (req, res, next) => {
  try {
    const { vehicleId, sessionId, pollType, value } = req.body;

    if (!vehicleId || !sessionId || !pollType || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicleId, sessionId, pollType, and value',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    }

    const vote = await VehicleVote.findOneAndUpdate(
      { vehicleId, sessionId, pollType },
      { value },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: vote, message: 'Vote recorded successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already voted on this poll' });
    }
    next(error);
  }
};

// @desc    Get vote stats for a vehicle
// @route   GET /api/vehicle-votes/:vehicleId/stats
// @access  Public
export const getVoteStats = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    }

    const objectId = new mongoose.Types.ObjectId(vehicleId);

    const valueForMoneyStats = await VehicleVote.aggregate([
      { $match: { vehicleId: objectId, pollType: 'value_for_money' } },
      { $group: { _id: '$value', count: { $sum: 1 } } },
    ]);

    const favoriteFeaturesStats = await VehicleVote.aggregate([
      { $match: { vehicleId: objectId, pollType: 'favorite_features' } },
      { $unwind: '$value' },
      { $group: { _id: '$value', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    let totalValueVotes = 0;
    let yesVotes = 0;
    let noVotes = 0;

    valueForMoneyStats.forEach((stat) => {
      totalValueVotes += stat.count;
      if (stat._id === 'yes') yesVotes = stat.count;
      if (stat._id === 'no') noVotes = stat.count;
    });

    const valueForMoney = {
      totalVotes: totalValueVotes,
      yesPercentage: totalValueVotes > 0 ? Math.round((yesVotes / totalValueVotes) * 100) : 0,
      noPercentage: totalValueVotes > 0 ? Math.round((noVotes / totalValueVotes) * 100) : 0,
    };

    const totalFeatureVotesArray = await VehicleVote.aggregate([
      { $match: { vehicleId: objectId, pollType: 'favorite_features' } },
      { $count: 'total' },
    ]);
    const totalFeatureVotes = totalFeatureVotesArray.length > 0 ? totalFeatureVotesArray[0].total : 0;

    const favoriteFeatures = {
      totalVotes: totalFeatureVotes,
      features: favoriteFeaturesStats.map((stat) => ({
        name: stat._id,
        count: stat.count,
        percentage: totalFeatureVotes > 0 ? Math.round((stat.count / totalFeatureVotes) * 100) : 0,
      })),
    };

    res.status(200).json({ success: true, data: { valueForMoney, favoriteFeatures } });
  } catch (error) {
    next(error);
  }
};
