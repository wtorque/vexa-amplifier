'use strict';
async function healthRoutes(fastify) {
  fastify.get('/health', async () => ({
    status: 'healthy', api: true, redis: false, database: false, workers: 1,
    timestamp: new Date().toISOString(),
  }));
}
module.exports = healthRoutes;
