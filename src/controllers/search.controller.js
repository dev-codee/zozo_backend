import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as searchService from '../services/search.service.js';

export const searchPhones = asyncHandler(async (req, res) => {
    // Calls searchService.performSearch
    res.status(200).json(new ApiResponse(200, [], "Search results fetched"));
});
