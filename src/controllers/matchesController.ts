import { RequestHandler } from 'express';
import { getMatches as _getMatches } from '../services/matchesService.js';

export const getMatches: RequestHandler<{
  date: string;
}> = async (req, res) => {
  try {
    const matches = await _getMatches(req.params.date);
    res.status(200).json({
      status: 'ok',
      message: null,
      size: matches.length,
      data: matches,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
      size: 0,
      data: null,
    });
  }
};
