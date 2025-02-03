import { getMatches as _getMatches } from '../services/matchesService.js';
import { catchError } from '../utils/catchError.js';

export const getMatches = async (req, res) => {
  try {
    const { size, matches } = await _getMatches();

    res.status(200).json({
      status: 'OK',
      size,
      data: matches,
    });
  } catch (error) {
    console.log(error);
  }
};
