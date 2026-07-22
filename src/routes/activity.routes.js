import { Router } from 'express';
import * as activityController from '../controllers/activity.controller.js';
import { protectAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/track', activityController.trackActivity);
router.get('/admin', protectAdmin, activityController.getAdminLogs);

export default router;
