const bcrypt = require('bcrypt');

module.exports = async function (fastify, opts) {
  // Get user settings
  fastify.get('/settings', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('SELECT * FROM settings WHERE user_id = $1', [request.user.id]);
      return result.rows[0] || {};
    } finally {
      client.release();
    }
  });

  // Update settings
  fastify.put('/settings', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const settings = request.body;
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'INSERT INTO settings (user_id, data) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET data = $2 RETURNING *',
        [request.user.id, JSON.stringify(settings)]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Generate API key
  fastify.post('/settings/api-key', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const apiKey = require('crypto').randomBytes(32).toString('hex');
    const client = await fastify.pg.connect();
    try {
      await client.query('UPDATE users SET api_key = $1 WHERE id = $2', [apiKey, request.user.id]);
      return { apiKey };
    } finally {
      client.release();
    }
  });

  // Change password
  fastify.put('/settings/password', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body;
    const client = await fastify.pg.connect();
    try {
      const user = await client.query('SELECT password FROM users WHERE id = $1', [request.user.id]);
      const validPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
      if (!validPassword) {
        return reply.code(401).send({ error: 'Invalid current password' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, request.user.id]);
      return { success: true, message: 'Password updated' };
    } finally {
      client.release();
    }
  });
};
