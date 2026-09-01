import { Router } from 'express';
import { getVehicleReviews, createVehicleReview } from '../controllers/vehicleReview.controller.js';
import { protectUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:vehicleId', getVehicleReviews);
router.post('/', protectUser, createVehicleReview);

export default router;
