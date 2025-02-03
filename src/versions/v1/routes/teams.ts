import { Router } from 'express';
import { getTeams, getTeamById } from '../../../controllers/teamsController.js';

export const router = Router();

router.get('/', getTeams);
router.get('/:id', getTeamById);
