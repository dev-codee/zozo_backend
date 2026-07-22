import mongoose from 'mongoose';

const phoneRevisionSchema = new mongoose.Schema({
    phoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Phone', required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    action: { type: String, enum: ['CREATED', 'UPDATED', 'APPROVED', 'REJECTED'], required: true },
    changes: { type: mongoose.Schema.Types.Mixed }, // Delta/Diff of what changed (optional, can be inferred from snapshots)
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true }, // The exact state of the phone BEFORE the change was made (or after if CREATED)
    note: { type: String } // Optional reviewer note
}, { timestamps: true });

// Index for quickly fetching history of a specific phone
phoneRevisionSchema.index({ phoneId: 1, createdAt: -1 });

export const PhoneRevision = mongoose.model('PhoneRevision', phoneRevisionSchema);
