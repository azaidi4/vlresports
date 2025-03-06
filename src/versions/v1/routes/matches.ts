import { Router } from 'express';
import {
  getClients,
  getMatches,
  getMatchesStream,
} from '../../../controllers/matchesController';

export const router = Router();

router.get('/clients', getClients);
router.get('/stream', getMatchesStream);
router.get('/:date', getMatches);
