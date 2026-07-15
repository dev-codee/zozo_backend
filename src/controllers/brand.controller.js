import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as brandService from '../services/brand.service.js';

export const getBrands = asyncHandler(async (req, res) => {
    // Calls brandService.getAllBrands
    res.status(200).json(new ApiResponse(200, [], "Brands fetched successfully"));
});

export const getBrandBySlug = asyncHandler(async (req, res) => {
    // Calls brandService.getBrandBySlug
    res.status(200).json(new ApiResponse(200, {}, "Brand fetched successfully"));
});
