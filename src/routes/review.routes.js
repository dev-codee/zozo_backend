import { Router } from 'express';
import { getPhoneReviews, createReview } from '../controllers/review.controller.js';
import { protectUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:phoneId', getPhoneReviews);
router.post('/', protectUser, createReview);

export default router;
