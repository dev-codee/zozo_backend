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
    
    const phones = await compareService.comparePhonesList(slugsArray);
    
    const { generateAIComparison } = await import('../services/ai.service.js');
    const verdict = await generateAIComparison(phones);
    
    res.status(200).json(new ApiResponse(200, { verdict }, "AI Comparison generated successfully"));
});
