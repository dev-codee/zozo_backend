import { Router } from 'express';
import { castVote, getVoteStats } from '../controllers/vote.controller.js';

const router = Router();

router.post('/', castVote);
router.get('/:phoneId/stats', getVoteStats);

export default router;
