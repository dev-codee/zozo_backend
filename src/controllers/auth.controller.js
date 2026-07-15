import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
// import * as authService from '../services/auth.service.js';

export const login = asyncHandler(async (req, res) => {
    // Auth login logic
    res.status(200).json(new ApiResponse(200, {}, "Logged in successfully"));
});

export const register = asyncHandler(async (req, res) => {
    // Auth register logic
    res.status(201).json(new ApiResponse(201, {}, "Registered successfully"));
});
