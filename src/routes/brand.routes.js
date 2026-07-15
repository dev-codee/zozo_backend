import { Router } from 'express';
import * as brandController from '../controllers/brand.controller.js';

const router = Router();

router.get('/', brandController.getBrands);
router.get('/:slug', brandController.getBrandBySlug);

export default router;
