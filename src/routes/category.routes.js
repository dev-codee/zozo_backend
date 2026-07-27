import express from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { protectAdmin, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin only routes
router.post('/', protectAdmin, requireRole(['SUPER_ADMIN', 'EDITOR']), createCategory);
router.put('/:id', protectAdmin, requireRole(['SUPER_ADMIN', 'EDITOR']), updateCategory);
router.delete('/:id', protectAdmin, requireRole(['SUPER_ADMIN']), deleteCategory);

export default router;
