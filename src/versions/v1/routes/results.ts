import { Router } from 'express';
import { getResults } from '../../../controllers/resultsController.js';

export const router = Router();

router.get('/', getResults);
