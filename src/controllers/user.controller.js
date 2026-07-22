import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Session } from '../models/Session.model.js';
import { ActivityLog } from '../models/ActivityLog.model.js';

export const getSessions = asyncHandler(async (req, res) => {
    const sessions = await Session.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, sessions, "Sessions fetched successfully"));
});

export const revokeSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await Session.findOne({ _id: id, userId: req.user._id });
    
    if (!session) {
        return res.status(404).json(new ApiResponse(404, null, "Session not found"));
    }

    if (session.sessionId === req.sessionId) {
        return res.status(400).json(new ApiResponse(400, null, "Cannot revoke current active session. Use logout instead."));
    }

    await session.deleteOne();
    res.status(200).json(new ApiResponse(200, null, "Session revoked successfully"));
});

export const getUserActivity = asyncHandler(async (req, res) => {
    const logs = await ActivityLog.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    res.status(200).json(new ApiResponse(200, logs, "Activity logs fetched"));
});
