import { Router } from 'express';
import { castVote, getVoteStats } from '../controllers/vehicleVote.controller.js';

const router = Router();

router.post('/', castVote);
router.get('/:vehicleId/stats', getVoteStats);

export default router;
