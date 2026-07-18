import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { protectAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', adminController.loginAdmin);

router.get('/stats', protectAdmin, adminController.getDashboardStats);
router.post('/upload', protectAdmin, upload.single('image'), adminController.uploadImage);
router.post('/phones', protectAdmin, adminController.createPhone);

export default router;
