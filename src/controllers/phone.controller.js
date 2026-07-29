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

export const getPhoneDescription = asyncHandler(async (req, res) => {
    const description = await phoneService.getPhoneDescription(req.params.slug);
    res.status(200).json(new ApiResponse(200, { description }, "Description fetched successfully"));
});

export const getRelatedPhones = asyncHandler(async (req, res) => {
    const related = await phoneService.getRelatedPhones(req.params.slug);
    if (!related) {
        return res.status(404).json(new ApiResponse(404, null, "Phone not found"));
    }
    res.status(200).json(new ApiResponse(200, related, "Related phones fetched successfully"));
});
