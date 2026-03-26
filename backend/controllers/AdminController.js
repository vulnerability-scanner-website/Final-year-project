const bcrypt = require('bcrypt');

class AdminController {
  constructor(fastify) {
    this.fastify = fastify;
  }

  // Helper function to create user notification
  async createNotification(userId, message) {
    try {
      const client = await this.fastify.pg.connect();
      try {
        await client.query(
          'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
          [userId, message]
        );
        console.log(`📢 Notification created for user ${userId}: ${message}`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Failed to create notification:', error.message);
    }
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
      
      const newUser = result.rows[0];

      // Notify the new user
      await this.createNotification(
        newUser.id,
        `Your account has been created by an administrator. Welcome to the security scanner platform!`
      );
      
      return { success: true, user: newUser };
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

      const updatedUser = result.rows[0];

      // Notify user about account update
      await this.createNotification(
        updatedUser.id,
        `Your account has been updated by an administrator. Role: ${role}, Status: ${status}`
      );

      return { success: true, user: updatedUser };
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

      const user = result.rows[0];

      // Create appropriate notification based on status change
      let message = '';
      if (status === 'active') {
        message = '🎉 Your account has been activated! You can now access all features.';
      } else if (status === 'inactive') {
        message = '⚠️ Your account has been deactivated. Please contact support if you believe this is an error.';
      } else if (status === 'pending') {
        message = '⏳ Your account status has been changed to pending. Please wait for further review.';
      }

      await this.createNotification(user.id, message);

      return { success: true, user };
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
      // Get user info before deletion for notification
      const userResult = await client.query('SELECT email FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }

      // First, delete all related scans and notifications
      await client.query('DELETE FROM scans WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
      
      // Then delete the user
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [userId]
      );

      return { success: true, message: 'User and associated data deleted successfully' };
    } catch (err) {
      console.error('Delete user error:', err);
      return reply.code(500).send({ error: 'Failed to delete user' });
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