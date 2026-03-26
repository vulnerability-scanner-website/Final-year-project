const bcrypt = require('bcrypt');
const UserModel = require('../models/User');

class AuthController {
  constructor(fastify) {
    this.fastify = fastify;
    this.userModel = new UserModel(fastify.pg);
  }

  // Helper function to notify admin
  async notifyAdmin(message) {
    try {
      const client = await this.fastify.pg.connect();
      try {
        // Get all admin users
        const adminResult = await client.query("SELECT id FROM users WHERE role = 'admin'");
        for (const admin of adminResult.rows) {
          await client.query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
            [admin.id, message]
          );
        }
        console.log(`📢 Admin notification: ${message}`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Failed to notify admin:', error.message);
    }
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

  async register(request, reply) {
    const { email, password, role } = request.body || {};
    
    if (!email || !password || !role) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }

    // Only allow developer or analyst roles for self-registration
    if (!['developer', 'analyst'].includes(role)) {
      return reply.code(400).send({ error: 'Invalid role. Only developer or analyst allowed for registration.' });
    }
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // New users start with pending status
      const client = await this.fastify.pg.connect();
      try {
        const result = await client.query(
          'INSERT INTO users (email, password, role, status) VALUES ($1, $2, $3, $4) RETURNING id, email, role, status, created_at',
          [email, hashedPassword, role, 'pending']
        );
        
        const user = result.rows[0];
        
        const token = this.fastify.jwt.sign({ 
          id: user.id,
          email: user.email, 
          role: user.role 
        });

        // Notify admin about new user registration
        await this.notifyAdmin(`New user registered: ${email} (${role}) - Account pending approval`);

        // Welcome notification for the new user
        await this.createNotification(
          user.id, 
          'Welcome! Your account has been created and is pending admin approval. You will be notified once approved.'
        );
        
        return { 
          success: true, 
          token, 
          user,
          message: 'Registration successful. Your account is pending admin approval.' 
        };
      } finally {
        client.release();
      }
    } catch (err) {
      if (err.code === '23505') {
        return reply.code(409).send({ error: 'Email already exists' });
      }
      throw err;
    }
  }

  async login(request, reply) {
    const { email, password } = request.body || {};
    
    if (!email || !password) {
      return reply.code(400).send({ error: 'Missing email or password' });
    }
    
    try {
      const user = await this.userModel.findByEmail(email);
      
      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Check if account is active
      if (user.status !== 'active') {
        return reply.code(403).send({ 
          error: 'Account not active. Please wait for admin approval or contact support.' 
        });
      }
      
      const token = this.fastify.jwt.sign({ 
        id: user.id,
        email: user.email, 
        role: user.role 
      });

      // Notify admin about user login (only for non-admin users)
      if (user.role !== 'admin') {
        await this.notifyAdmin(`User ${email} (${user.role}) logged in`);
      }

      // Create login notification for user
      await this.createNotification(user.id, 'You have successfully logged in to your account.');
      
      return { 
        success: true, 
        token, 
        user: { id: user.id, email: user.email, role: user.role, status: user.status } 
      };
    } catch (error) {
      console.error('Login error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;