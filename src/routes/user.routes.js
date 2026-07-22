import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protectUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protectUser); // All user routes require authentication

router.get('/sessions', userController.getSessions);
router.delete('/sessions/:id', userController.revokeSession);
router.get('/activity', userController.getUserActivity);

export default router;
