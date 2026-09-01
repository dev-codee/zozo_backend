import mongoose from 'mongoose';

// Community polls for EVs. Mirrors Vote.js but references the Vehicle
// collection. `favorite_features` values are EV-type specific (the frontend
// sends the appropriate option set per vehicle category); the backend simply
// stores whatever strings it receives.
const vehicleVoteSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  pollType: {
    type: String,
    required: true,
    enum: ['value_for_money', 'favorite_features'],
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // String ('yes'/'no') or Array of strings
    required: true,
  },
}, { timestamps: true });

// One vote per session per poll type per vehicle
vehicleVoteSchema.index({ vehicleId: 1, sessionId: 1, pollType: 1 }, { unique: true });

const VehicleVote = mongoose.model('VehicleVote', vehicleVoteSchema);

export default VehicleVote;
