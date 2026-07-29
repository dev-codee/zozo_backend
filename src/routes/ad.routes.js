import express from 'express';
import {
    createAd,
    getAds,
    getAdById,
    updateAd,
    deleteAd,
    getActiveAdByPlacement
} from '../controllers/ad.controller.js';

// If there are admin authentication middlewares, they should be imported and used here.
// e.g. import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public route for fetching ads by placement
router.get('/placements/:placement', getActiveAdByPlacement);

// Admin routes
router.route('/')
    .get(getAds) // apply protect, admin if available
    .post(createAd);

router.route('/:id')
    .get(getAdById)
    .put(updateAd)
    .delete(deleteAd);

export default router;
