const bcrypt = require('bcrypt');

class AdminController {
  constructor(fastify) {
    this.fastify = fastify;
  }

  // Get all users (admin only)
  async getAllUsers(request, reply) {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied. Admin only.' });
    }

    const client = await this.fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Get user by ID (admin only)
  async getUserById(request, reply) {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied. Admin only.' });
    }

    const client = await this.fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT id, email, role, status, created_at FROM users WHERE id = $1',
        [request.params.id]
      );
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Create user (admin only)
  async createUser(request, reply) {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied. Admin only.' });
    }

    const { email, password, role, status } = request.body;

    if (!email || !password || !role) {
      return reply.code(400).send({ error: 'Email, password, and role are required' });
    }

    const client = await this.fastify.pg.connect();
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await client.query(
        'INSERT INTO users (email, password, role, status) VALUES ($1, $2, $3, $4) RETURNING id, email, role, status, created_at',
        [email, hashedPassword, role, status || 'active']
      );
      
      return { success: true, user: result.rows[0] };
    } catch (err) {
      if (err.code === '23505') {
        return reply.code(409).send({ error: 'Email already exists' });
      }
      throw err;
    } finally {
      client.release();
    }
  }

  // Update user (admin only)
  async updateUser(request, reply) {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied. Admin only.' });
    }

    const { email, role, status } = request.body;
    const userId = request.params.id;

    if (!email || !role) {
      return reply.code(400).send({ error: 'Email and role are required' });
    }

    const client = await this.fastify.pg.connect();
    try {
      const result = await client.query(
        'UPDATE users SET email = $1, role = $2, status = $3 WHERE id = $4 RETURNING id, email, role, status, created_at',
        [email, role, status, userId]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return { success: true, user: result.rows[0] };
    } catch (err) {
      if (err.code === '23505') {
        return reply.code(409).send({ error: 'Email already exists' });
      }
      throw err;
    } finally {
      client.release();
    }
  }

  // Activate/Deactivate user (admin only)
  async toggleUserStatus(request, reply) {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied. Admin only.' });
    }

    const { status } = request.body;
    const userId = request.params.id;

    if (!status || !['active', 'inactive', 'pending'].includes(status)) {
      return reply.code(400).send({ error: 'Valid status required (active, inactive, pending)' });
    }

    const client = await this.fastify.pg.connect();
    try {
      const result = await client.query(
        'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, role, status',
        [status, userId]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return { success: true, user: result.rows[0] };
    } finally {
      client.release();
    }
  }

  // Delete user (admin only)
  async deleteUser(request, reply) {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied. Admin only.' });
    }

    const userId = request.params.id;

    // Prevent admin from deleting themselves
    if (parseInt(userId) === request.user.id) {
      return reply.code(400).send({ error: 'Cannot delete your own account' });
    }

    const client = await this.fastify.pg.connect();
    try {
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [userId]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return { success: true, message: 'User deleted successfully' };
    } finally {
      client.release();
    }
  }

  // Get user statistics (admin only)
  async getUserStats(request, reply) {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied. Admin only.' });
    }

    const client = await this.fastify.pg.connect();
    try {
      const totalUsers = await client.query('SELECT COUNT(*) FROM users');
      const activeUsers = await client.query('SELECT COUNT(*) FROM users WHERE status = $1', ['active']);
      const pendingUsers = await client.query('SELECT COUNT(*) FROM users WHERE status = $1', ['pending']);
      const inactiveUsers = await client.query('SELECT COUNT(*) FROM users WHERE status = $1', ['inactive']);
      const usersByRole = await client.query('SELECT role, COUNT(*) FROM users GROUP BY role');

      return {
        total: parseInt(totalUsers.rows[0].count),
        active: parseInt(activeUsers.rows[0].count),
        pending: parseInt(pendingUsers.rows[0].count),
        inactive: parseInt(inactiveUsers.rows[0].count),
        byRole: usersByRole.rows
      };
    } finally {
      client.release();
    }
  }
}

module.exports = AdminController;
