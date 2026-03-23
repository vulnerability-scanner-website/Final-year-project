module.exports = async function (fastify, opts) {

  // ==================== PRICING PLANS (ADMIN CRUD) ====================

  // Get all pricing plans (public)
  fastify.get('/pricing', async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('SELECT * FROM pricing ORDER BY price ASC');
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Create pricing plan (admin only)
  fastify.post('/pricing', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' });

    const { name, price, features } = request.body;
    if (!name || !price) return reply.code(400).send({ error: 'name and price are required' });

    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'INSERT INTO pricing (name, price, features) VALUES ($1, $2, $3) RETURNING *',
        [name, price, JSON.stringify(features || [])]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Update pricing plan (admin only)
  fastify.put('/pricing/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' });

    const { name, price, features } = request.body;
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'UPDATE pricing SET name = $1, price = $2, features = $3 WHERE id = $4 RETURNING *',
        [name, price, JSON.stringify(features || []), request.params.id]
      );
      if (result.rows.length === 0) return reply.code(404).send({ error: 'Plan not found' });
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Delete pricing plan (admin only)
  fastify.delete('/pricing/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' });

    const client = await fastify.pg.connect();
    try {
      const result = await client.query('DELETE FROM pricing WHERE id = $1 RETURNING id', [request.params.id]);
      if (result.rows.length === 0) return reply.code(404).send({ error: 'Plan not found' });
      return { success: true };
    } finally {
      client.release();
    }
  });

  // ==================== SUBSCRIPTION MANAGEMENT (ADMIN) ====================

  // Get all subscriptions with user info (admin only)
  fastify.get('/admin/subscriptions', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' });

    const client = await fastify.pg.connect();
    try {
      const result = await client.query(`
        SELECT s.*, u.email, u.role as user_role
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.created_at DESC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Activate subscription (admin only)
  fastify.patch('/admin/subscriptions/:id/activate', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' });

    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        `UPDATE subscriptions SET status = 'active', payment_status = 'paid' WHERE id = $1 RETURNING *`,
        [request.params.id]
      );
      if (result.rows.length === 0) return reply.code(404).send({ error: 'Subscription not found' });
      return { success: true, subscription: result.rows[0] };
    } finally {
      client.release();
    }
  });

  // Deactivate subscription (admin only)
  fastify.patch('/admin/subscriptions/:id/deactivate', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' });

    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        `UPDATE subscriptions SET status = 'inactive' WHERE id = $1 RETURNING *`,
        [request.params.id]
      );
      if (result.rows.length === 0) return reply.code(404).send({ error: 'Subscription not found' });
      return { success: true, subscription: result.rows[0] };
    } finally {
      client.release();
    }
  });

  // Confirm payment manually (admin only)
  fastify.patch('/admin/subscriptions/:id/confirm-payment', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' });

    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        `UPDATE subscriptions SET payment_status = 'paid', status = 'active' WHERE id = $1 RETURNING *`,
        [request.params.id]
      );
      if (result.rows.length === 0) return reply.code(404).send({ error: 'Subscription not found' });
      return { success: true, subscription: result.rows[0] };
    } finally {
      client.release();
    }
  });
};
