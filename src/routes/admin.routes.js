import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { protectAdmin, requireRole, requirePermission } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', adminController.loginAdmin);

router.get('/stats', protectAdmin, adminController.getDashboardStats);
router.post('/upload', protectAdmin, upload.single('image'), adminController.uploadImage);

// Phones management
router.get('/phones', protectAdmin, adminController.getAllPhones);
router.post('/phones', protectAdmin, requirePermission('edit_content'), adminController.createPhone);
router.post('/phones/ai-fill', protectAdmin, requirePermission('edit_content'), adminController.aiFillPhone);
router.get('/phones/check-duplicate', protectAdmin, adminController.checkDuplicate);
router.delete('/phones/:id', protectAdmin, requirePermission('delete_content'), adminController.deletePhone);
router.get('/phones/:id', protectAdmin, adminController.getPhoneById);
router.put('/phones/:id', protectAdmin, requirePermission('edit_content'), adminController.updatePhone);

// Workflow
router.post('/phones/:id/approve', protectAdmin, requireRole(['SUPER_ADMIN', 'MODERATOR']), adminController.approvePhone);
router.post('/phones/:id/reject', protectAdmin, requireRole(['SUPER_ADMIN', 'MODERATOR']), adminController.rejectPhone);
router.get('/phones/:id/revisions', protectAdmin, adminController.getPhoneRevisions);

// Team management
router.get('/team', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.getTeamMembers);
router.post('/team', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.createTeamMember);
router.put('/team/:id', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.updateTeamMember);
router.delete('/team/:id', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.deleteTeamMember);
router.get('/team/:id/activity', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.getTeamMemberActivity);

// Activity Logs
router.get('/activity-logs', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.getAdminActivityLogs);

export default router;
