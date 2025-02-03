import { Router } from 'express';
import { getEvents } from '../../../controllers/eventsController.js';

export const router = Router();
router.get('/', getEvents);
// router.get("/:id", playersController.getPlayerById);
