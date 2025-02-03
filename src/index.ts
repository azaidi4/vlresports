import 'dotenv/config';
import express, { urlencoded, json } from 'express';
import apicache from 'apicache';
import morgan from 'morgan';
import cors from 'cors';

import { router } from './versions/v1/routes/index.js';
import { router as teamsRouter } from './versions/v1/routes/teams.js';
import { router as playersRouter } from './versions/v1/routes/players.js';
import { router as eventsRouter } from './versions/v1/routes/events.js';
import { router as matchesRouter } from './versions/v1/routes/matches.js';
import { router as resultsRouter } from './versions/v1/routes/results.js';

const app = express();

apicache.options({
  debug: true,
  statusCodes: {
    include: [200],
  },
  enabled: false,
});
const cache = apicache.middleware;

// Settings
app.set('port', process.env.SERVER_PORT || 5000);

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(urlencoded({ extended: false }));
app.use(json());

// Routes
app.use(router);
app.use('/api', router);
// - Version 1
app.use('/api/v1/teams', cache('5 minutes'), teamsRouter);
app.use('/api/v1/players', cache('5 minutes'), playersRouter);
app.use('/api/v1/events', cache('5 minutes'), eventsRouter);
app.use('/api/v1/matches', cache('5 minutes'), matchesRouter);
app.use('/api/v1/results', cache('5 minutes'), resultsRouter);

app.get('/api/cache/performance', (req, res) => {
  res.json(apicache.getPerformance());
});

// add route to display cache index
app.get('/api/cache/index', (req, res) => {
  res.json(apicache.getIndex());
});

// Starting server
app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}`);
});
