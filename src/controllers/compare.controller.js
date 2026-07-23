import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as compareService from '../services/compare.service.js';

export const comparePhones = asyncHandler(async (req, res) => {
    const { slugs, phone, slug } = req.query;
    
    let slugsArray = [];
    
    if (slugs) {
        slugsArray = typeof slugs === 'string' ? slugs.split(',') : slugs;
    } else if (phone) {
        slugsArray = typeof phone === 'string' ? phone.split(',') : phone;
    } else if (slug) {
        slugsArray = typeof slug === 'string' ? slug.split(',') : slug;
    }
    
    // Clean and filter empty values
    slugsArray = (Array.isArray(slugsArray) ? slugsArray : [slugsArray])
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter((s) => s.length > 0);
        
    if (slugsArray.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No slugs provided for comparison"));
    }
    
    const comparisonData = await compareService.comparePhonesList(slugsArray);
    res.status(200).json(new ApiResponse(200, comparisonData, "Comparison data generated successfully"));
});

export const getAIComparison = asyncHandler(async (req, res) => {
    const { slugs } = req.query;
    
    let slugsArray = [];
    if (slugs) {
        slugsArray = typeof slugs === 'string' ? slugs.split(',') : slugs;
    }
    
    slugsArray = slugsArray.map(s => s.trim()).filter(s => s.length > 0);
    
    if (slugsArray.length < 2) {
        return res.status(400).json(new ApiResponse(400, null, "At least two phones are required for AI comparison"));
    }
    
    const sortedSlugs = [...slugsArray].sort();
    const Comparison = (await import('../models/Comparison.model.js')).default;
    const existingComparison = await Comparison.findOne({ slugs: sortedSlugs });
    
    if (existingComparison && existingComparison.ai_verdict) {
        return res.status(200).json(new ApiResponse(200, { verdict: existingComparison.ai_verdict }, "AI Comparison fetched from cache"));
    }
    
    const phones = await compareService.comparePhonesList(slugsArray);
    if (phones.length !== slugsArray.length) {
        return res.status(404).json(new ApiResponse(404, null, "One or more phones not found or not approved"));
    }
    
    const { generateAIComparison } = await import('../services/ai.service.js');
    const verdict = await generateAIComparison(phones);
    
    if (verdict) {
        await Comparison.findOneAndUpdate(
            { slugs: sortedSlugs },
            { 
                $set: { ai_verdict: verdict },
                $setOnInsert: { phones: phones.map(p => p._id) }
            },
            { upsert: true, new: true }
        );
    }
    
    res.status(200).json(new ApiResponse(200, { verdict }, "AI Comparison generated successfully"));
});

export const trackComparison = asyncHandler(async (req, res) => {
    const { slugs } = req.body;
    
    let slugsArray = [];
    if (slugs) {
        slugsArray = typeof slugs === 'string' ? slugs.split(',') : slugs;
    }
    
    slugsArray = slugsArray.map(s => s.trim()).filter(s => s.length > 0);
    
    if (slugsArray.length < 2) {
        return res.status(400).json(new ApiResponse(400, null, "At least two phones are required for tracking"));
    }
    
    const comparison = await compareService.trackComparison(slugsArray);
    if (!comparison) {
        return res.status(404).json(new ApiResponse(404, null, "Phones not found"));
    }
    
    res.status(200).json(new ApiResponse(200, comparison, "Comparison tracked successfully"));
});

export const getPopularComparisons = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const popular = await compareService.getPopularComparisons(limit);
    
    res.status(200).json(new ApiResponse(200, popular, "Popular comparisons retrieved successfully"));
});
