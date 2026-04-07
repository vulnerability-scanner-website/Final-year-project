const { validateInput, schemas } = require('../middlewares/validation');
const SQLHelper = require('../utils/sqlHelper');

module.exports = async function (fastify, opts) {
  // Get all reports
  fastify.get('/reports', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
        [request.user.id]
      );
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Create report
  fastify.post('/reports', { 
    onRequest: [fastify.authenticate],
    preHandler: validateInput(schemas.createReport)
  }, async (request, reply) => {
    const { name, type, subtype } = request.body;
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'INSERT INTO reports (user_id, name, type, status, subtype, size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [request.user.id, name, type, 'Generated', subtype || null, 0]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Get report by ID
  fastify.get('/reports/:id', { 
    onRequest: [fastify.authenticate],
    preHandler: async (request, reply) => {
      try {
        request.params.id = SQLHelper.validateId(request.params.id);
      } catch (error) {
        return reply.code(400).send({ error: error.message });
      }
    }
  }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM reports WHERE id = $1 AND user_id = $2', 
        [request.params.id, request.user.id]
      );
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Report not found' });
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Delete report
  fastify.delete('/reports/:id', { 
    onRequest: [fastify.authenticate],
    preHandler: async (request, reply) => {
      try {
        request.params.id = SQLHelper.validateId(request.params.id);
      } catch (error) {
        return reply.code(400).send({ error: error.message });
      }
    }
  }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'DELETE FROM reports WHERE id = $1 AND user_id = $2 RETURNING id', 
        [request.params.id, request.user.id]
      );
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Report not found' });
      }
      return { success: true, message: 'Report deleted' };
    } finally {
      client.release();
    }
  });

  // Download report
  fastify.get('/reports/:id/download', { 
    onRequest: [fastify.authenticate],
    preHandler: async (request, reply) => {
      try {
        request.params.id = SQLHelper.validateId(request.params.id);
      } catch (error) {
        return reply.code(400).send({ error: error.message });
      }
    }
  }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM reports WHERE id = $1 AND user_id = $2', 
        [request.params.id, request.user.id]
      );
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Report not found' });
      }
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="${result.rows[0].name}.pdf"`);
      return { message: 'Report download initiated' };
    } finally {
      client.release();
    }
  });
};
