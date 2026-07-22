import { Router } from 'express';
import phoneRoutes from './phone.routes.js';
import brandRoutes from './brand.routes.js';
import compareRoutes from './compare.routes.js';
import taxRoutes from './tax.routes.js';
import searchRoutes from './search.routes.js';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import homeRoutes from './home.routes.js';
import activityRoutes from './activity.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/home', homeRoutes);
router.use('/phones', phoneRoutes);
router.use('/brands', brandRoutes);
router.use('/compare', compareRoutes);
router.use('/tax', taxRoutes);
router.use('/search', searchRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/activity', activityRoutes);
router.use('/user', userRoutes);

export default router;
