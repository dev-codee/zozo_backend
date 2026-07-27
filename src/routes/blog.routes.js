import express from 'express';
import { getBlogs, getBlogById, getBlogBySlug, createBlog, updateBlog, deleteBlog } from '../controllers/blog.controller.js';
import { protectAdmin, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);

// Admin only routes
router.post('/', protectAdmin, requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR']), createBlog);
router.put('/:id', protectAdmin, requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR']), updateBlog);
router.delete('/:id', protectAdmin, requireRole(['SUPER_ADMIN']), deleteBlog);

export default router;
