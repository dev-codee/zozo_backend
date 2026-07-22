import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for anonymous tracking
    type: { type: String, required: true }, // e.g., 'PAGE_VIEW', 'LOGIN', 'LOGOUT', 'REGISTER'
    details: { type: String }, // e.g., '/phones/samsung-galaxy-s24'
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

// Index for faster queries on admin dashboard
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ type: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });

// TTL Index: Auto-delete logs older than 30 days (2592000 seconds)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
