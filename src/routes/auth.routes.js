import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protectUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);
router.get('/me', protectUser, authController.getMe);

export default router;
