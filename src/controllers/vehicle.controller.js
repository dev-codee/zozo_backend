import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as vehicleService from '../services/vehicle.service.js';

export const getVehicles = asyncHandler(async (req, res) => {
    const vehicles = await vehicleService.getAllVehicles(req.query);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json(new ApiResponse(200, vehicles, "Vehicles fetched successfully"));
});

export const getVehicleBySlug = asyncHandler(async (req, res) => {
    const data = await vehicleService.getVehicleBySlug(req.params.slug);
    if (!data || !data.vehicle) {
        return res.status(404).json(new ApiResponse(404, null, "Vehicle not found"));
    }
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json(new ApiResponse(200, data, "Vehicle fetched successfully"));
});

export const getRelatedVehicles = asyncHandler(async (req, res) => {
    const related = await vehicleService.getRelatedVehicles(req.params.slug);
    if (!related) {
        return res.status(404).json(new ApiResponse(404, null, "Vehicle not found"));
    }
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json(new ApiResponse(200, related, "Related vehicles fetched successfully"));
});

