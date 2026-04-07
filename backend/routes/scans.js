const ScanController = require('../controllers/ScanController');
const MemoryScanController = require('../controllers/MemoryScanController');
const scanStorage = require('../config/scan-storage');
const { validateInput, schemas } = require('../middlewares/validation');
const SQLHelper = require('../utils/sqlHelper');

module.exports = async function (fastify, opts) {
  const scanController = scanStorage.TEMPORARY_SCAN_MODE 
    ? new MemoryScanController(fastify)
    : new ScanController(fastify);

  fastify.get('/scans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return scanController.getAll(request, reply);
  });

  fastify.post('/scans', { 
    onRequest: [fastify.authenticate],
    preHandler: validateInput(schemas.createScan)
  }, async (request, reply) => {
    return scanController.create(request, reply);
  });

  fastify.get('/scans/:id', { 
    onRequest: [fastify.authenticate],
    preHandler: async (request, reply) => {
      try {
        request.params.id = SQLHelper.validateId(request.params.id);
      } catch (error) {
        return reply.code(400).send({ error: error.message });
      }
    }
  }, async (request, reply) => {
    return scanController.getById(request, reply);
  });

  fastify.get('/scans/:id/progress', { 
    onRequest: [fastify.authenticate],
    preHandler: async (request, reply) => {
      try {
        request.params.id = SQLHelper.validateId(request.params.id);
      } catch (error) {
        return reply.code(400).send({ error: error.message });
      }
    }
  }, async (request, reply) => {
    return scanController.getProgress(request, reply);
  });

  fastify.delete('/scans/:id', { 
    onRequest: [fastify.authenticate],
    preHandler: async (request, reply) => {
      try {
        request.params.id = SQLHelper.validateId(request.params.id);
      } catch (error) {
        return reply.code(400).send({ error: error.message });
      }
    }
  }, async (request, reply) => {
    return scanController.delete(request, reply);
  });

  fastify.post('/scans/:id/pause', { 
    onRequest: [fastify.authenticate],
    preHandler: async (request, reply) => {
      try {
        request.params.id = SQLHelper.validateId(request.params.id);
      } catch (error) {
        return reply.code(400).send({ error: error.message });
      }
    }
  }, async (request, reply) => {
    return scanController.pause(request, reply);
  });

  fastify.post('/scans/:id/resume', { 
    onRequest: [fastify.authenticate],
    preHandler: async (request, reply) => {
      try {
        request.params.id = SQLHelper.validateId(request.params.id);
      } catch (error) {
        return reply.code(400).send({ error: error.message });
      }
    }
  }, async (request, reply) => {
    return scanController.resume(request, reply);
  });

  fastify.post('/scans/:id/stop', { 
    onRequest: [fastify.authenticate],
    preHandler: async (request, reply) => {
      try {
        request.params.id = SQLHelper.validateId(request.params.id);
      } catch (error) {
        return reply.code(400).send({ error: error.message });
      }
    }
  }, async (request, reply) => {
    return scanController.stop(request, reply);
  });

  fastify.post('/scans/:id/rerun', { 
    onRequest: [fastify.authenticate],
    preHandler: async (request, reply) => {
      try {
        request.params.id = SQLHelper.validateId(request.params.id);
      } catch (error) {
        return reply.code(400).send({ error: error.message });
      }
    }
  }, async (request, reply) => {
    return scanController.rerun(request, reply);
  });
};
