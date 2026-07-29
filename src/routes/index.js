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
import voteRoutes from './vote.routes.js';
import categoryRoutes from './category.routes.js';
import blogRoutes from './blog.routes.js';
import pageRoutes from './page.routes.js';
import reviewRoutes from './review.routes.js';
import adRoutes from './ad.routes.js';

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
router.use('/votes', voteRoutes);
router.use('/categories', categoryRoutes);
router.use('/blogs', blogRoutes);
router.use('/pages', pageRoutes);
router.use('/reviews', reviewRoutes);
router.use('/ads', adRoutes);

export default router;
