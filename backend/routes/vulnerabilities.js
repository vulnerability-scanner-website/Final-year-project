const VulnerabilityController = require('../controllers/VulnerabilityController');
const MemoryScanController = require('../controllers/MemoryScanController');
const scanStorage = require('../config/scan-storage');

module.exports = async function (fastify, opts) {
  const vulnerabilityController = new VulnerabilityController(fastify);
  const memoryScanController = new MemoryScanController(fastify);

  fastify.get('/vulnerabilities', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return vulnerabilityController.getAll(request, reply);
  });

  fastify.get('/scans/:scanId/vulnerabilities', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (scanStorage.TEMPORARY_SCAN_MODE) {
      return memoryScanController.getVulnerabilitiesByScanId(request, reply);
    }
    return vulnerabilityController.getByScanId(request, reply);
  });

  fastify.get('/vulnerabilities/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return vulnerabilityController.getById(request, reply);
  });

  fastify.put('/vulnerabilities/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return vulnerabilityController.updateStatus(request, reply);
  });
};
