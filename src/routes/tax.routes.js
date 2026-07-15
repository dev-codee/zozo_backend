import { Router } from 'express';
import * as taxController from '../controllers/tax.controller.js';

const router = Router();

router.post('/calculate', taxController.calculateTax);

export default router;
