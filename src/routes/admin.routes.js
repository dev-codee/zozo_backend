import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

router.get('/stats', adminController.getDashboardStats);

export default router;
