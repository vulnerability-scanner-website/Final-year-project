const bcrypt = require('bcrypt');

module.exports = async function (fastify, opts) {

  // ── User Settings (all roles) ──────────────────────────────────────────────

  fastify.get('/settings', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('SELECT * FROM settings WHERE user_id = $1', [request.user.id]);
      return result.rows[0]?.data || {};
    } finally { client.release(); }
  });

  fastify.put('/settings', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'INSERT INTO settings (user_id, data) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET data = $2 RETURNING *',
        [request.user.id, JSON.stringify(request.body)]
      );
      return { success: true, settings: result.rows[0] };
    } finally { client.release(); }
  });

  fastify.put('/settings/password', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body;
    if (!currentPassword || !newPassword) return reply.code(400).send({ error: 'Both passwords required' });
    const client = await fastify.pg.connect();
    try {
      const user = await client.query('SELECT password FROM users WHERE id = $1', [request.user.id]);
      const valid = await bcrypt.compare(currentPassword, user.rows[0].password);
      if (!valid) return reply.code(401).send({ error: 'Invalid current password' });
      const hashed = await bcrypt.hash(newPassword, 10);
      await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, request.user.id]);
      return { success: true, message: 'Password updated successfully' };
    } finally { client.release(); }
  });

  fastify.post('/settings/api-key', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const apiKey = require('crypto').randomBytes(32).toString('hex');
    const client = await fastify.pg.connect();
    try {
      await client.query(
        `DO $$ BEGIN
           IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='api_key') THEN
             UPDATE users SET api_key = '${apiKey}' WHERE id = ${request.user.id};
           END IF;
         END $$;`
      );
      return { apiKey };
    } finally { client.release(); }
  });

  // ── Admin System Settings ──────────────────────────────────────────────────

  // Get system-wide settings
  fastify.get('/admin/settings/system', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Admin only' });
    const client = await fastify.pg.connect();
    try {
      const result = await client.query("SELECT data FROM settings WHERE user_id = 0");
      return result.rows[0]?.data || {
        allowRegistration: true,
        requireEmailVerification: false,
        maxScansPerUser: 3,
        maxScansPerMonth: 3,
        autoApproveUsers: true,
        maintenanceMode: false,
        scanTimeout: 300,
        allowedRoles: ['developer', 'analyst'],
        systemName: 'CyberTrace Security Scanner',
        supportEmail: 'admin@security.com',
      };
    } finally { client.release(); }
  });

  // Save system-wide settings
  fastify.put('/admin/settings/system', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Admin only' });
    const client = await fastify.pg.connect();
    try {
      await client.query(
        'INSERT INTO settings (user_id, data) VALUES (0, $1) ON CONFLICT (user_id) DO UPDATE SET data = $1',
        [JSON.stringify(request.body)]
      );
      return { success: true, message: 'System settings saved' };
    } finally { client.release(); }
  });

  // Get all users with stats (admin user access control)
  fastify.get('/admin/settings/users', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Admin only' });
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(`
        SELECT u.id, u.email, u.role, u.status, u.created_at,
               COUNT(s.id) as scan_count,
               COALESCE(u.free_scans_used, 0) as free_scans_used
        FROM users u
        LEFT JOIN scans s ON s.user_id = u.id
        GROUP BY u.id, u.email, u.role, u.status, u.created_at, u.free_scans_used
        ORDER BY u.created_at DESC
      `);
      return result.rows;
    } finally { client.release(); }
  });

  // Update user role (admin only)
  fastify.patch('/admin/settings/users/:id/role', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Admin only' });
    const { role } = request.body;
    if (!['developer', 'analyst', 'admin'].includes(role)) return reply.code(400).send({ error: 'Invalid role' });
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role, status',
        [role, request.params.id]
      );
      if (!result.rows.length) return reply.code(404).send({ error: 'User not found' });
      // Notify user
      await client.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [request.params.id, '🔄 Role Updated', `Your account role has been changed to ${role} by an administrator.`, 'info']
      );
      return { success: true, user: result.rows[0] };
    } finally { client.release(); }
  });

  // Update user status (admin only)
  fastify.patch('/admin/settings/users/:id/status', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Admin only' });
    const { status } = request.body;
    if (!['active', 'inactive', 'pending'].includes(status)) return reply.code(400).send({ error: 'Invalid status' });
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, role, status',
        [status, request.params.id]
      );
      if (!result.rows.length) return reply.code(404).send({ error: 'User not found' });
      const msg = status === 'active' ? '✅ Your account has been activated.' :
                  status === 'inactive' ? '⛔ Your account has been deactivated.' :
                  '⏳ Your account is pending review.';
      await client.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [request.params.id, '👤 Account Status Changed', msg, status === 'active' ? 'success' : 'warning']
      );
      return { success: true, user: result.rows[0] };
    } finally { client.release(); }
  });

  // Reset user free scans (admin only)
  fastify.patch('/admin/settings/users/:id/reset-scans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Admin only' });
    const client = await fastify.pg.connect();
    try {
      await client.query('UPDATE users SET free_scans_used = 0 WHERE id = $1', [request.params.id]);
      return { success: true, message: 'Free scans reset' };
    } finally { client.release(); }
  });

  // Get system stats (admin only)
  fastify.get('/admin/settings/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Admin only' });
    const client = await fastify.pg.connect();
    try {
      const users = await client.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='active') as active, COUNT(*) FILTER (WHERE status='pending') as pending, COUNT(*) FILTER (WHERE status='inactive') as inactive FROM users");
      const scans = await client.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='Running') as running, COUNT(*) FILTER (WHERE status='Completed') as completed FROM scans");
      const vulns = await client.query('SELECT COUNT(*) as total FROM vulnerabilities');
      const subs  = await client.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='active') as active FROM subscriptions");
      return {
        users: users.rows[0],
        scans: scans.rows[0],
        vulnerabilities: vulns.rows[0],
        subscriptions: subs.rows[0],
      };
    } finally { client.release(); }
  });
};
