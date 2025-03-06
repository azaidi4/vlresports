import { Router } from 'express';
import {
  getEvents,
  getEventsStream,
  updateEventsStream,
} from '../../../controllers/eventsController';

export const router = Router();
router.get('/', getEvents);
router.get('/stream', getEventsStream);
router.patch('/stream', updateEventsStream);
