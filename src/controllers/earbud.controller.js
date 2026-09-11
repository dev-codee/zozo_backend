import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as earbudService from '../services/earbud.service.js';

export const getEarbuds = asyncHandler(async (req, res) => {
    const data = await earbudService.getAllEarbuds(req.query);
    res.status(200).json(new ApiResponse(200, data, "Earbuds fetched successfully"));
});

export const getEarbudBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const earbud = await earbudService.getEarbudBySlug(slug);

    if (!earbud) {
        return res.status(404).json(new ApiResponse(404, null, "Earbud not found"));
    }

    res.status(200).json(new ApiResponse(200, earbud, "Earbud fetched successfully"));
});

export const getRelatedEarbuds = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const related = await earbudService.getRelatedEarbuds(slug);

    if (!related) {
        return res.status(404).json(new ApiResponse(404, null, "Earbud not found"));
    }

    res.status(200).json(new ApiResponse(200, related, "Related earbuds fetched successfully"));
});
