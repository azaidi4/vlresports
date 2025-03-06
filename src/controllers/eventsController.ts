import { RequestHandler, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { getEvents as _getEvents } from '../services/eventsService';
import { regions } from '../utils/regions';

const clients = new Map<string, Response>();
const testData: { count: number; timestamp: number } = {
  count: 0,
  timestamp: Date.now(),
};

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

export const getEventsStream: RequestHandler = (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };

  res.writeHead(200, headers);
  res.write(`data: ${JSON.stringify(testData)}\n\n`);

  const clientId = uuid();
  clients.set(clientId, res);
  req.log.info({ msg: 'New connection for client', clientId });

  req.on('close', () => {
    req.log.info({ msg: 'Connection closed for client', clientId });
    clients.delete(clientId);
  });
};

export const updateEventsStream: RequestHandler = (req, res) => {
  testData.count++;
  testData.timestamp = Date.now();
  res.status(200).send();
  return sendEventsToAll();
};

const sendEventsToAll = () => {
  clients.forEach((res) => res.write(`data: ${JSON.stringify(testData)}\n\n`));
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
