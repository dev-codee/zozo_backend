import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as compareVehicleService from '../services/compareVehicle.service.js';

const parseSlugs = (raw) => {
    let slugsArray = [];
    if (raw) {
        slugsArray = typeof raw === 'string' ? raw.split(',') : raw;
    }
    return (Array.isArray(slugsArray) ? slugsArray : [slugsArray])
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter((s) => s.length > 0);
};

export const compareVehicles = asyncHandler(async (req, res) => {
    const { slugs, vehicle, slug } = req.query;
    const slugsArray = parseSlugs(slugs || vehicle || slug);

    if (slugsArray.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No slugs provided for comparison"));
    }

    const comparisonData = await compareVehicleService.compareVehiclesList(slugsArray);
    res.status(200).json(new ApiResponse(200, comparisonData, "Comparison data generated successfully"));
});

export const getAIVehicleComparison = asyncHandler(async (req, res) => {
    const slugsArray = parseSlugs(req.query.slugs);

    if (slugsArray.length < 2) {
        return res.status(400).json(new ApiResponse(400, null, "At least two vehicles are required for AI comparison"));
    }

    const sortedSlugs = [...slugsArray].sort();
    const VehicleComparison = (await import('../models/VehicleComparison.model.js')).default;
    const existing = await VehicleComparison.findOne({ slugs: sortedSlugs });

    if (existing && existing.ai_verdict && existing.ai_key_differences) {
        return res.status(200).json(new ApiResponse(200, {
            verdict: existing.ai_verdict,
            key_differences: existing.ai_key_differences,
        }, "AI Comparison fetched from cache"));
    }

    const vehicles = await compareVehicleService.compareVehiclesList(slugsArray);
    if (vehicles.length !== slugsArray.length) {
        return res.status(404).json(new ApiResponse(404, null, "One or more vehicles not found"));
    }

    const { generateAIVehicleComparison } = await import('../services/ai.service.js');
    const aiResponse = await generateAIVehicleComparison(vehicles);

    if (aiResponse && aiResponse.verdict) {
        await VehicleComparison.findOneAndUpdate(
            { slugs: sortedSlugs },
            {
                $set: {
                    ai_verdict: aiResponse.verdict,
                    ai_key_differences: aiResponse.key_differences || {},
                },
                $setOnInsert: { vehicles: vehicles.map((v) => v._id) },
            },
            { upsert: true, new: true }
        );

        return res.status(200).json(new ApiResponse(200, {
            verdict: aiResponse.verdict,
            key_differences: aiResponse.key_differences || {},
        }, "AI Comparison generated successfully"));
    }

    res.status(500).json(new ApiResponse(500, null, "Failed to generate AI Comparison"));
});

export const trackVehicleComparison = asyncHandler(async (req, res) => {
    const slugsArray = parseSlugs(req.body.slugs);

    if (slugsArray.length < 2) {
        return res.status(400).json(new ApiResponse(400, null, "At least two vehicles are required for tracking"));
    }

    const comparison = await compareVehicleService.trackVehicleComparison(slugsArray);
    if (!comparison) {
        return res.status(404).json(new ApiResponse(404, null, "Vehicles not found"));
    }

    res.status(200).json(new ApiResponse(200, comparison, "Comparison tracked successfully"));
});

export const getPopularVehicleComparisons = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const popular = await compareVehicleService.getPopularVehicleComparisons(limit);

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json(new ApiResponse(200, popular, "Popular comparisons retrieved successfully"));
});
