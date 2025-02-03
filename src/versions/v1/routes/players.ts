import { Router } from 'express';
import {
  getPlayers,
  getPlayerById,
} from '../../../controllers/playersController.js';

export const router = Router();

router.get('/', getPlayers);
router.get('/:id', getPlayerById);
