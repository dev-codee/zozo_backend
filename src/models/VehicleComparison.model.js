import mongoose from 'mongoose';

// Tracks how often two (or more) EVs are compared side-by-side, and caches the
// AI-generated verdict for that exact matchup. Mirrors Comparison.model.js but
// references the Vehicle collection so the phone and EV comparison histories
// stay independent.
const vehicleComparisonSchema = new mongoose.Schema(
    {
        slugs: {
            type: [String],
            required: true,
            index: true,
        },
        vehicles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vehicle',
            },
        ],
        hits: {
            type: Number,
            default: 1,
        },
        ai_verdict: {
            type: String,
        },
        ai_key_differences: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

const VehicleComparison = mongoose.model('VehicleComparison', vehicleComparisonSchema);

export default VehicleComparison;
