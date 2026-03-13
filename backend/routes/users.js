module.exports = async function (fastify, opts) {
  // Get all users (admin only)
  fastify.get('/users', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC');
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Create new user (admin only)
  fastify.post('/users', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const { email, password, role, status } = request.body;
    const bcrypt = require('bcrypt');
    const client = await fastify.pg.connect();
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await client.query(
        'INSERT INTO users (email, password, role, status) VALUES ($1, $2, $3, $4) RETURNING id, email, role, status, created_at',
        [email, hashedPassword, role || 'user', status || 'active']
      );
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        return reply.code(409).send({ error: 'Email already exists' });
      }
      throw err;
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
      const result = await client.query('SELECT id, email, role, status, created_at FROM users WHERE id = $1', [request.params.id]);
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
    const { email, role, status } = request.body;
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'UPDATE users SET email = $1, role = $2, status = $3 WHERE id = $4 RETURNING id, email, role, status',
        [email, role, status, request.params.id]
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
