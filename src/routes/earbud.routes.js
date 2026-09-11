import { Router } from 'express';
import * as earbudController from '../controllers/earbud.controller.js';

const router = Router();

router.get('/', earbudController.getEarbuds);
router.get('/:slug', earbudController.getEarbudBySlug);
router.get('/:slug/related', earbudController.getRelatedEarbuds);

export default router;
