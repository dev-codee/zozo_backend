import express from 'express';
import { getPages, getPageById, getPageBySlug, createPage, updatePage, deletePage } from '../controllers/page.controller.js';
import { protectAdmin, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getPages);
router.get('/slug/:slug', getPageBySlug);
router.get('/:id', getPageById);

// Admin only routes
router.post('/', protectAdmin, requireRole(['SUPER_ADMIN', 'EDITOR']), createPage);
router.put('/:id', protectAdmin, requireRole(['SUPER_ADMIN', 'EDITOR']), updatePage);
router.delete('/:id', protectAdmin, requireRole(['SUPER_ADMIN']), deletePage);

export default router;
