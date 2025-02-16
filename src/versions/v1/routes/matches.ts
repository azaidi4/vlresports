import { Router } from 'express';
import { getMatches } from '../../../controllers/matchesController.js';

export const router = Router();

router.get('/:date', getMatches);
