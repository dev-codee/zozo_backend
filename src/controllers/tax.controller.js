import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as taxService from '../services/tax.service.js';

export const calculateTax = asyncHandler(async (req, res) => {
    // Calls taxService.calculatePtaTax
    res.status(200).json(new ApiResponse(200, {}, "Tax calculated"));
});
