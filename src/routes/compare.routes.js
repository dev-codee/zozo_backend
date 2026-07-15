import { Router } from 'express';
import * as compareController from '../controllers/compare.controller.js';

const router = Router();

router.get('/', compareController.comparePhones);

export default router;
