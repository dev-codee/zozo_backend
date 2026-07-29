import Ad from '../models/Ad.model.js';

// @desc    Create a new ad
// @route   POST /api/ads
// @access  Private/Admin
export const createAd = async (req, res) => {
    try {
        const ad = await Ad.create(req.body);
        res.status(201).json({
            success: true,
            data: ad,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all ads
// @route   GET /api/ads
// @access  Private/Admin
export const getAds = async (req, res) => {
    try {
        const query = {};
        
        // Optional filtering by placement
        if (req.query.placement) {
            query.placement = req.query.placement;
        }

        const ads = await Ad.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: ads.length,
            data: ads,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
};

// @desc    Get single ad
// @route   GET /api/ads/:id
// @access  Private/Admin
export const getAdById = async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        
        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found',
            });
        }
        
        res.status(200).json({
            success: true,
            data: ad,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
};

// @desc    Update ad
// @route   PUT /api/ads/:id
// @access  Private/Admin
export const updateAd = async (req, res) => {
    try {
        const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found',
            });
        }

        res.status(200).json({
            success: true,
            data: ad,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete ad
// @route   DELETE /api/ads/:id
// @access  Private/Admin
export const deleteAd = async (req, res) => {
    try {
        const ad = await Ad.findByIdAndDelete(req.params.id);

        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found',
            });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'Ad deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
};

// @desc    Get active ad by placement
// @route   GET /api/ads/placements/:placement
// @access  Public
export const getActiveAdByPlacement = async (req, res) => {
    try {
        const { placement } = req.params;
        const currentDate = new Date();

        const query = {
            placement,
            isActive: true,
            $or: [
                { startDate: { $exists: false } },
                { startDate: null },
                { startDate: { $lte: currentDate } }
            ],
            $and: [
                { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: currentDate } }] }
            ]
        };

        // Get all active ads for the placement
        const ads = await Ad.find(query).sort({ createdAt: -1 });

        if (!ads || ads.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active ad found for this placement',
            });
        }

        // Increment view count asynchronously for all fetched ads
        const adIds = ads.map(ad => ad._id);
        Ad.updateMany({ _id: { $in: adIds } }, { $inc: { views: 1 } }).exec();

        res.status(200).json({
            success: true,
            data: ads,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
};
