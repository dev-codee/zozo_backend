import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { ActivityLog } from '../models/ActivityLog.model.js';
import jwt from 'jsonwebtoken';

export const trackActivity = asyncHandler(async (req, res) => {
    const { type, details } = req.body;
    let userId = null;

    // Optional: Extract userId if user is logged in hehe
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            userId = decoded._id;
        } catch (error) {
            // ignore
        }
    }

    await ActivityLog.create({
        userId,
        type: type || 'PAGE_VIEW',
        details,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.status(200).json(new ApiResponse(200, null, "Activity tracked"));
});

export const getAdminLogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email');

    const total = await ActivityLog.countDocuments();

    res.status(200).json(new ApiResponse(200, {
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    }, "Logs fetched successfully"));
});
