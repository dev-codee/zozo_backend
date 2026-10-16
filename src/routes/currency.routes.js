import { Router } from 'express';
import { getExchangeRates } from '../services/exchangeRates.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();
router.get('/rates', asyncHandler(async (_req, res) => {
    const data = await getExchangeRates();
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: { base: 'USD', ...data } });
}));
export default router;
