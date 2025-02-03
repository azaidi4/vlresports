import { Request, Response } from 'express';
import {
  getTeams as _getTeams,
  getTeamById as _getTeamById,
} from '../services/teamsService.js';
import { catchError } from '../utils/catchError.js';
import { RegionKey, regions } from '../utils/regions.js';

export const getTeams = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = req.query.limit || 10;
  const pagination = {
    page,
    limit,
  };

  const regionQuery = (req.query.region as RegionKey) || 'all';
  if (!regions[regionQuery]) {
    res.status(400).json({
      status: 'error',
      message: {
        error: 400,
        message: 'Invalid region',
      },
    });
    return;
  }

  const region = regions[regionQuery];
  try {
    const {
      teams,
      pagination: { totalElements, totalPages, hasNextPage },
    } = await _getTeams(pagination, region);

    res.status(200).json({
      status: 'OK',
      region,
      size: teams.length,
      pagination: {
        page,
        limit,
        totalElements,
        totalPages,
        hasNextPage,
      },
      data: teams,
    });
  } catch (error) {
    catchError(res, error);
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const team = await _getTeamById(id);
    res.status(200).json({
      status: 'OK',
      data: team,
    });
  } catch (error) {
    catchError(res, error);
  }
};
