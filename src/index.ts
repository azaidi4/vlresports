import 'dotenv/config';
import express, { urlencoded, json } from 'express';
import apiCache from 'apicache';
import morgan from 'morgan';
import cors from 'cors';

import { router } from './versions/v1/routes/index.js';
import { router as teamsRouter } from './versions/v1/routes/teams.js';
import { router as playersRouter } from './versions/v1/routes/players.js';
import { router as eventsRouter } from './versions/v1/routes/events.js';
import { router as matchesRouter } from './versions/v1/routes/matches.js';
import { router as resultsRouter } from './versions/v1/routes/results.js';

const app = express();

apiCache.options({
  debug: true,
  defaultDuration: process.env.CACHE_DURATION || '5 minutes',
  statusCodes: {
    include: [200],
  },
  enabled: false,
});

const cache = apiCache.middleware;

// Settings
app.set('port', process.env.SERVER_PORT || 5000);

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(function (req, res, next) {
  res.setHeader(
    'User-Agent',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'
  );
  next();
});

// Routes
app.use(router);
app.use('/api', router);
// - Version 1
app.use('/api/v1/teams', cache(), teamsRouter);
app.use('/api/v1/players', cache(), playersRouter);
app.use('/api/v1/events', cache(), eventsRouter);
app.use('/api/v1/matches', cache(), matchesRouter);
app.use('/api/v1/results', cache(), resultsRouter);

app.get('/api/cache/performance', (req, res) => {
  res.json(apiCache.getPerformance());
});

// add route to display cache index
app.get('/api/cache/index', (req, res) => {
  res.json(apiCache.getIndex());
});

// Starting server
app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}`);
});
