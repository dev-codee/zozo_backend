import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Phone } from '../models/Phone.model.js';
import { Brand } from '../models/Brand.model.js';

export const getHomeData = asyncHandler(async (req, res) => {
    // Fetch trending phones (latest 8, published, sorted by rating)
    const trendingPhones = await Phone.find({ approvalStatus: 'APPROVED' })
        .sort({ 'rating.average': -1, createdAt: -1 })
        .limit(8)
        .select('slug name brand_slug images specs.performance.ram_options_gb specs.performance.storage_options_gb prices rating status')
        .lean();

    // Fetch all brands
    const brands = await Brand.find()
        .sort({ name: 1 })
        .lean();

    // Get latest phones (most recently added)
    const latestPhones = await Phone.find({ approvalStatus: 'APPROVED' })
        .sort({ createdAt: -1 })
        .limit(4)
        .select('slug name brand_slug images specs.performance.ram_options_gb specs.performance.storage_options_gb prices rating status')
        .lean();

    res.status(200).json(new ApiResponse(200, {
        trending: trendingPhones,
        latest: latestPhones,
        brands,
    }, "Home data fetched successfully"));
});
