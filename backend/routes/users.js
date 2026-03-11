module.exports = async function (fastify, opts) {
  // Get all users (admin only)
  fastify.get('/users', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC');
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Get user statistics (admin only)
  fastify.get('/users/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const client = await fastify.pg.connect();
    try {
      const totalUsers = await client.query('SELECT COUNT(*) FROM users');
      const usersByRole = await client.query('SELECT role, COUNT(*) FROM users GROUP BY role');
      return {
        total: parseInt(totalUsers.rows[0].count),
        byRole: usersByRole.rows
      };
    } finally {
      client.release();
    }
  });

  // Get user by ID (admin only)
  fastify.get('/users/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('SELECT id, email, role, created_at FROM users WHERE id = $1', [request.params.id]);
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Update user (admin only)
  fastify.put('/users/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const { email, role } = request.body;
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'UPDATE users SET email = $1, role = $2 WHERE id = $3 RETURNING id, email, role',
        [email, role, request.params.id]
      );
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Delete user (admin only)
  fastify.delete('/users/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [request.params.id]);
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }
      return { success: true, message: 'User deleted' };
    } finally {
      client.release();
    }
  });
};
