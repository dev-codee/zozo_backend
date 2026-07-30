import { Router } from 'express';
import { submitBenchmark, getAdminBenchmarks, updateBenchmarkStatus } from '../controllers/benchmark.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { protectUser, protectAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Route for authenticated users to submit benchmarks
router.post('/', protectUser, upload.single('screenshot'), submitBenchmark);

// Admin routes
router.get('/admin', protectAdmin, getAdminBenchmarks);
router.patch('/admin/:id/status', protectAdmin, updateBenchmarkStatus);

export default router;
