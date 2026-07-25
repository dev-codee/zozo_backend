import Vote from '../models/Vote.js';
import mongoose from 'mongoose';

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Public
export const castVote = async (req, res, next) => {
  try {
    const { phoneId, sessionId, pollType, value } = req.body;

    if (!phoneId || !sessionId || !pollType || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phoneId, sessionId, pollType, and value',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(phoneId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone ID',
      });
    }

    // Upsert the vote (update if exists, insert if not)
    const vote = await Vote.findOneAndUpdate(
      { phoneId, sessionId, pollType },
      { value },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: vote,
      message: 'Vote recorded successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already voted on this poll',
      });
    }
    next(error);
  }
};

// @desc    Get vote stats for a phone
// @route   GET /api/votes/:phoneId/stats
// @access  Public
export const getVoteStats = async (req, res, next) => {
  try {
    const { phoneId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(phoneId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone ID',
      });
    }

    // Aggregate value_for_money votes
    const valueForMoneyStats = await Vote.aggregate([
      { $match: { phoneId: new mongoose.Types.ObjectId(phoneId), pollType: 'value_for_money' } },
      {
        $group: {
          _id: '$value',
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregate favorite_features votes
    const favoriteFeaturesStats = await Vote.aggregate([
      { $match: { phoneId: new mongoose.Types.ObjectId(phoneId), pollType: 'favorite_features' } },
      { $unwind: '$value' }, // Because value is an array of strings here
      {
        $group: {
          _id: '$value',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } }
    ]);

    // Format value_for_money
    let totalValueVotes = 0;
    let yesVotes = 0;
    let noVotes = 0;

    valueForMoneyStats.forEach(stat => {
      totalValueVotes += stat.count;
      if (stat._id === 'yes') yesVotes = stat.count;
      if (stat._id === 'no') noVotes = stat.count;
    });

    const valueForMoney = {
      totalVotes: totalValueVotes,
      yesPercentage: totalValueVotes > 0 ? Math.round((yesVotes / totalValueVotes) * 100) : 0,
      noPercentage: totalValueVotes > 0 ? Math.round((noVotes / totalValueVotes) * 100) : 0,
    };

    // Format favorite_features
    const totalFeatureVotesArray = await Vote.aggregate([
       { $match: { phoneId: new mongoose.Types.ObjectId(phoneId), pollType: 'favorite_features' } },
       { $count: "total" }
    ]);
    const totalFeatureVotes = totalFeatureVotesArray.length > 0 ? totalFeatureVotesArray[0].total : 0;

    const favoriteFeatures = {
      totalVotes: totalFeatureVotes,
      features: favoriteFeaturesStats.map(stat => ({
        name: stat._id,
        count: stat.count,
        percentage: totalFeatureVotes > 0 ? Math.round((stat.count / totalFeatureVotes) * 100) : 0,
      }))
    };

    res.status(200).json({
      success: true,
      data: {
        valueForMoney,
        favoriteFeatures
      },
    });
  } catch (error) {
    next(error);
  }
};
