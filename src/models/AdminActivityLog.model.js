import mongoose from 'mongoose';

const adminActivityLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    action: { type: String, required: true }, // e.g., 'CREATE_PHONE', 'APPROVE_PHONE', 'LOGIN'
    entityType: { type: String }, // e.g., 'PHONE', 'TEAM_MEMBER'
    entityId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

// Indexes for fast dashboard lookups
adminActivityLogSchema.index({ adminId: 1, createdAt: -1 });
adminActivityLogSchema.index({ action: 1, createdAt: -1 });
adminActivityLogSchema.index({ createdAt: -1 });

// Store admin logs for 1 year (31536000 seconds)
adminActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export const AdminActivityLog = mongoose.model('AdminActivityLog', adminActivityLogSchema);
