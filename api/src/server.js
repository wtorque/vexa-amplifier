'use strict';
require('dotenv').config();
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');

const searchRoutes = require('./routes/search');
const streamRoutes = require('./routes/stream');
const presetsRoutes = require('./routes/presets');
const healthRoutes = require('./routes/health');

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
app.register(multipart, { limits: { fileSize: 500 * 1024 * 1024 } });

app.register(searchRoutes, { prefix: '/api' });
app.register(streamRoutes, { prefix: '/api' });
app.register(presetsRoutes, { prefix: '/api' });
app.register(healthRoutes, { prefix: '' });

const PORT = process.env.PORT || 3001;
app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) { app.log.error(err); process.exit(1); }
  console.log('[Vexa API] listening on http://0.0.0.0:' + PORT);
});

module.exports = app;
