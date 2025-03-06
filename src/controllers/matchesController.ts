import { CronJob } from 'cron';

import { isValid, lightFormat, parse } from 'date-fns';
import { RequestHandler, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { getMatches as _getMatches } from '../services/matchesService';
import { newClient } from '../utils/redis';
import { logger } from '../utils/logger';

const clients = new Map<string, Response>();

const redisClient = newClient();
const pub = newClient();
const sub = newClient();

sub.subscribe('messages-stream', (err, count) => {
  if (err) {
    // Just like other commands, subscribe() can fail for some reasons,
    // ex network issues.
    logger.info('Failed to subscribe: %s', err.message);
  } else {
    // `count` represents the number of channels this client are currently subscribed to.
    logger.info(
      `Subscribed successfully! This client is currently subscribed to ${count} channels.`
    );
  }
});

sub.on('message', async (channel, message) => {
  logger.info('Redis: Refresh matches cache');
  await redisClient.call('JSON.SET', 'matches', '$', message);

  if (clients.size > 0) {
    logger.info(`Pushing ${channel} channel event to clients`);
    clients.forEach((res) => res.write(`data: ${message}\n\n`));
  }
});

// cron;
export const getMatches: RequestHandler<{
  date: string;
}> = async (req, res) => {
  try {
    if (!isValid(parse(req.params.date, 'yyyy-MM-dd', new Date()))) {
      throw new Error('Invalid date');
    }
    const matches = await _getMatches(req.params.date);

    res.status(200).json({
      status: 'ok',
      message: null,
      size: Object.keys(matches).length,
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

export const getMatchesStream: RequestHandler = async (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

  const cachedMatches = await redisClient.call('JSON.GET', 'matches');
  res.write(`data: ${cachedMatches}\n\n`);
  const clientId = uuid();
  clients.set(clientId, res);
  req.log.info({ msg: 'New connection for client', clientId });

  req.on('close', () => {
    req.log.info({ msg: 'Connection closed for client', clientId });
    clients.delete(clientId);
  });
};

export const getClients: RequestHandler = (_, res) => {
  res.status(200).json({
    count: clients.size,
    clients: [...clients.keys()],
  });
};

new CronJob(
  '*/30 * * * * *',
  async () => {
    try {
      const matches = await _getMatches(lightFormat(Date.now(), 'yyyy-MM-dd'));
      pub.publish(
        'messages-stream',
        JSON.stringify({
          status: 'ok',
          message: null,
          size: Object.keys(matches).length,
          data: matches,
        })
      );
    } catch (error) {
      logger.error(error);
    }
  },
  null,
  true
);
