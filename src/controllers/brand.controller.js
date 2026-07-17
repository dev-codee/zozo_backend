import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as brandService from '../services/brand.service.js';
import * as phoneService from '../services/phone.service.js';

export const getBrands = asyncHandler(async (req, res) => {
    const brands = await brandService.getAllBrands();
    res.status(200).json(new ApiResponse(200, brands, "Brands fetched successfully"));
});

export const getBrandBySlug = asyncHandler(async (req, res) => {
    const brand = await brandService.getBrandBySlug(req.params.slug);
    if (!brand) {
        return res.status(404).json(new ApiResponse(404, null, "Brand not found"));
    }
    res.status(200).json(new ApiResponse(200, brand, "Brand fetched successfully"));
});

export const getBrandPhones = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const phones = await phoneService.getPhonesByBrandSlug(slug);
    res.status(200).json(new ApiResponse(200, phones, "Brand phones fetched successfully"));
});
