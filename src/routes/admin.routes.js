import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as adminVehicleController from '../controllers/adminVehicle.controller.js';
import * as adminBrandController from '../controllers/adminBrand.controller.js';
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
router.post('/phones/ai-fill-seo', protectAdmin, requirePermission('edit_content'), adminController.aiFillPhoneSEO);
router.get('/phones/check-duplicate', protectAdmin, adminController.checkDuplicate);
router.delete('/phones/:id', protectAdmin, requirePermission('delete_content'), adminController.deletePhone);
router.get('/phones/:id', protectAdmin, adminController.getPhoneById);
router.put('/phones/:id', protectAdmin, requirePermission('edit_content'), adminController.updatePhone);
router.get('/phones/:id/reviews', protectAdmin, requirePermission('edit_content'), adminController.getPhoneReviewsAdmin);
router.put('/reviews/:id', protectAdmin, requirePermission('edit_content'), adminController.updateReviewAdmin);
router.delete('/reviews/:id', protectAdmin, requirePermission('delete_content'), adminController.deleteReviewAdmin);

// Workflow
router.post('/phones/:id/approve', protectAdmin, requireRole(['SUPER_ADMIN', 'MODERATOR']), adminController.approvePhone);
router.post('/phones/:id/reject', protectAdmin, requireRole(['SUPER_ADMIN', 'MODERATOR']), adminController.rejectPhone);
router.get('/phones/:id/revisions', protectAdmin, adminController.getPhoneRevisions);

// EVs / Vehicles management
router.get('/vehicles', protectAdmin, adminVehicleController.getAllVehicles);
router.post('/vehicles', protectAdmin, requirePermission('edit_content'), adminVehicleController.createVehicle);
router.post('/vehicles/ai-fill', protectAdmin, requirePermission('edit_content'), adminVehicleController.aiFillVehicle);
router.post('/vehicles/ai-fill-seo', protectAdmin, requirePermission('edit_content'), adminVehicleController.aiFillVehicleSEO);
router.get('/vehicles/check-duplicate', protectAdmin, adminVehicleController.checkVehicleDuplicate);
router.delete('/vehicles/:id', protectAdmin, requirePermission('delete_content'), adminVehicleController.deleteVehicle);
router.get('/vehicles/:id', protectAdmin, adminVehicleController.getVehicleById);
router.put('/vehicles/:id', protectAdmin, requirePermission('edit_content'), adminVehicleController.updateVehicle);
router.post('/vehicles/:id/approve', protectAdmin, requireRole(['SUPER_ADMIN', 'MODERATOR']), adminVehicleController.approveVehicle);
router.post('/vehicles/:id/reject', protectAdmin, requireRole(['SUPER_ADMIN', 'MODERATOR']), adminVehicleController.rejectVehicle);
router.get('/vehicles/:id/revisions', protectAdmin, adminVehicleController.getVehicleRevisions);

// Brands management (shared by Mobiles & EVs)
router.get('/brands', protectAdmin, adminBrandController.getBrandsAdmin);
router.post('/brands', protectAdmin, requirePermission('edit_content'), adminBrandController.createBrand);
router.put('/brands/:id', protectAdmin, requirePermission('edit_content'), adminBrandController.updateBrand);
router.delete('/brands/:id', protectAdmin, requirePermission('delete_content'), adminBrandController.deleteBrand);

// Team management
router.get('/team', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.getTeamMembers);
router.post('/team', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.createTeamMember);
router.put('/team/:id', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.updateTeamMember);
router.delete('/team/:id', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.deleteTeamMember);
router.get('/team/:id/activity', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.getTeamMemberActivity);

// Activity Logs
router.get('/activity-logs', protectAdmin, requireRole(['SUPER_ADMIN']), adminController.getAdminActivityLogs);

export default router;
