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

  fastify.delete('/scans/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return scanController.delete(request, reply);
  });
};
