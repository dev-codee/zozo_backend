import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as searchService from '../services/search.service.js';

export const searchPhones = asyncHandler(async (req, res) => {
    const queryStr = req.query.q || '';
    let results = [];
    if (queryStr) {
        // Fallback to regex search if text index isn't created, or just use regex for partial matches
        results = await searchService.performSearch(queryStr);
    }
    res.status(200).json(new ApiResponse(200, results, "Search results fetched"));
});
