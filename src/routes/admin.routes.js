import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { protectAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', adminController.loginAdmin);

router.get('/stats', protectAdmin, adminController.getDashboardStats);
router.post('/upload', protectAdmin, upload.single('image'), adminController.uploadImage);

router.get('/phones', protectAdmin, adminController.getAllPhones);
router.post('/phones', protectAdmin, adminController.createPhone);
router.post('/phones/ai-fill', protectAdmin, adminController.aiFillPhone);
router.delete('/phones/:id', protectAdmin, adminController.deletePhone);
router.get('/phones/:id', protectAdmin, adminController.getPhoneById);
router.put('/phones/:id', protectAdmin, adminController.updatePhone);
export default router;
