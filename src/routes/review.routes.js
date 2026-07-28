import { Router } from 'express';
import { getPhoneReviews, createReview } from '../controllers/review.controller.js';

const router = Router();

router.get('/:phoneId', getPhoneReviews);
router.post('/', createReview);

export default router;
