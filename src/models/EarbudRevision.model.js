import mongoose from 'mongoose';

const earbudRevisionSchema = new mongoose.Schema({
    earbudId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Earbud',
        required: true,
        index: true,
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true,
    },
    action: {
        type: String,
        enum: ['CREATED', 'UPDATED', 'APPROVED', 'REJECTED'],
        required: true,
    },
    note: {
        type: String,
    },
    snapshot: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
}, { timestamps: true });

export const EarbudRevision = mongoose.model('EarbudRevision', earbudRevisionSchema);
