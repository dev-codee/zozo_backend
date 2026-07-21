import { Router } from 'express';
import * as phoneController from '../controllers/phone.controller.js';

const router = Router();

// Define phone routes
router.get('/', phoneController.getPhones);
router.get('/:slug', phoneController.getPhoneBySlug);
router.get('/:slug/description', phoneController.getPhoneDescription);

export default router;
