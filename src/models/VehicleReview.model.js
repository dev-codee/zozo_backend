import mongoose from 'mongoose';

// User reviews for EVs. Mirrors Review.model.js but references the Vehicle
// collection so EV and phone reviews stay independent.
const vehicleReviewSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
    index: true,
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
  },
}, { timestamps: true });

const VehicleReview = mongoose.model('VehicleReview', vehicleReviewSchema);

export default VehicleReview;
