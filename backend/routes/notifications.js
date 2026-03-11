module.exports = async function (fastify, opts) {
  // Get user notifications
  fastify.get('/notifications', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [request.user.id]);
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Mark notification as read
  fastify.put('/notifications/:id/read', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [request.params.id, request.user.id]
      );
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Notification not found' });
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Delete notification
  fastify.delete('/notifications/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id', [request.params.id, request.user.id]);
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Notification not found' });
      }
      return { success: true, message: 'Notification deleted' };
    } finally {
      client.release();
    }
  });
};
