import { Router } from 'express';
import * as vehicleController from '../controllers/vehicle.controller.js';

const router = Router();

router.get('/', vehicleController.getVehicles);
router.get('/:slug/related', vehicleController.getRelatedVehicles);
router.get('/:slug', vehicleController.getVehicleBySlug);

export default router;
