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
  fastify.post('/reports', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { name, type, subtype } = request.body;
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'INSERT INTO reports (user_id, name, type, status, subtype, size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [request.user.id, name, type, 'Generated', subtype, 0]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Get report by ID
  fastify.get('/reports/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('SELECT * FROM reports WHERE id = $1', [request.params.id]);
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Report not found' });
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Delete report
  fastify.delete('/reports/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('DELETE FROM reports WHERE id = $1 RETURNING id', [request.params.id]);
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Report not found' });
      }
      return { success: true, message: 'Report deleted' };
    } finally {
      client.release();
    }
  });

  // Download report
  fastify.get('/reports/:id/download', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('SELECT * FROM reports WHERE id = $1', [request.params.id]);
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
