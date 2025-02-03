import { getResults as _getResults } from '../services/resultsService.js';
import { catchError } from '../utils/catchError.js';

export const getResults = async (req, res) => {
  const page = req.query.page || 1;
  try {
    const { size, results } = await _getResults(page);

    res.status(200).json({
      status: 'OK',
      size,
      data: results,
    });
  } catch (error) {}
};