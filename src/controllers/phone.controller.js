import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as phoneService from '../services/phone.service.js';

export const getPhones = asyncHandler(async (req, res) => {
    // Calls phoneService.getAllPhones
    const phones = await phoneService.getAllPhones(req.query);
    res.status(200).json(new ApiResponse(200, phones, "Phones fetched successfully"));
});

export const getPhoneBySlug = asyncHandler(async (req, res) => {
    // Calls phoneService.getPhoneBySlug
    const phone = await phoneService.getPhoneBySlug(req.params.slug);
    res.status(200).json(new ApiResponse(200, phone, "Phone fetched successfully"));
});
