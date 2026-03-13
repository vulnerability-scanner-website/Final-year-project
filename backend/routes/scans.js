const ScanController = require('../controllers/ScanController');

module.exports = async function (fastify, opts) {
  const scanController = new ScanController(fastify);

  fastify.get('/scans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return scanController.getAll(request, reply);
  });

  fastify.post('/scans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return scanController.create(request, reply);
  });

  fastify.get('/scans/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return scanController.getById(request, reply);
  });

  fastify.get('/scans/:id/progress', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return scanController.getProgress(request, reply);
  });

  fastify.delete('/scans/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return scanController.delete(request, reply);
  });

  fastify.post('/scans/:id/pause', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return scanController.pause(request, reply);
  });

  fastify.post('/scans/:id/resume', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return scanController.resume(request, reply);
  });

  fastify.post('/scans/:id/stop', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return scanController.stop(request, reply);
  });

  fastify.post('/scans/:id/rerun', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return scanController.rerun(request, reply);
  });
};
