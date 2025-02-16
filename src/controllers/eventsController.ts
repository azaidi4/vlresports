import { RequestHandler } from 'express';
import { getEvents as _getEvents } from '../services/eventsService.js';
import { regions } from '../utils/regions.js';

export const getEvents: RequestHandler<
  object,
  object,
  object,
  { status: string; page: number; region: keyof typeof regions }
> = async (req, res) => {
  const status = req.query.status || 'all';
  const page = req.query.page ?? 1;
  const regionQuery = req.query.region || 'all';

  if (!regions[regionQuery]) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid region',
    });
    return;
  }

  try {
    const events = await _getEvents(status, regions[regionQuery], page);

    res.status(200).json({
      status: 'ok',
      message: null,
      size: events.length,
      data: events,
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

// To do: Add getEventById
/*const getEventById = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await eventsService.getEventById(id);

    res.status(200).json({
      status: "OK",
      data: event,
    });
  } catch (error) {}
};*/
