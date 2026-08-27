import mongoose from 'mongoose';

const vehicleRevisionSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    action: { type: String, enum: ['CREATED', 'UPDATED', 'APPROVED', 'REJECTED'], required: true },
    changes: { type: mongoose.Schema.Types.Mixed }, // Optional delta/diff of what changed
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true }, // State BEFORE the change (or after, for CREATED)
    note: { type: String }, // Optional reviewer note
}, { timestamps: true });

vehicleRevisionSchema.index({ vehicleId: 1, createdAt: -1 });

export const VehicleRevision = mongoose.model('VehicleRevision', vehicleRevisionSchema);
