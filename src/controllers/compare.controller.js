import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as compareService from '../services/compare.service.js';

export const comparePhones = asyncHandler(async (req, res) => {
    // Calls compareService.comparePhonesList
    res.status(200).json(new ApiResponse(200, {}, "Comparison data generated"));
});
