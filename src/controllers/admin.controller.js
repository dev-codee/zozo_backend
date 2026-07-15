import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as adminService from '../services/admin.service.js'; // Assuming you might have one, or aggregate services

export const getDashboardStats = asyncHandler(async (req, res) => {
    // Calls admin services to gather stats
    res.status(200).json(new ApiResponse(200, {}, "Dashboard stats fetched"));
});
