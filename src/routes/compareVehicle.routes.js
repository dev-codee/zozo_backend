import { Router } from 'express';
import * as compareVehicleController from '../controllers/compareVehicle.controller.js';

const router = Router();

router.get('/ai', compareVehicleController.getAIVehicleComparison);
router.post('/track', compareVehicleController.trackVehicleComparison);
router.get('/popular', compareVehicleController.getPopularVehicleComparisons);
router.get('/', compareVehicleController.compareVehicles);

export default router;
