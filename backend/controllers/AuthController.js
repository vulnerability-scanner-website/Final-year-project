const bcrypt = require('bcrypt');
const crypto = require('crypto');
const UserModel = require('../models/User');
const NotificationModel = require('../models/Notification');
const { validator } = require('../middlewares/validation');

class AuthController {
  constructor(fastify) {
    this.fastify = fastify;
    this.userModel = new UserModel(fastify.pg);
    this.notificationModel = new NotificationModel(fastify.pg);
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  }

  async register(request, reply) {
    const { email, password, role } = request.body || {};
    
    // Sanitize inputs
    const sanitizedEmail = validator.sanitizeString(email, 255).toLowerCase();
    
    if (!['developer', 'analyst'].includes(role)) {
      return reply.code(400).send({ error: 'Invalid role. Only developer or analyst allowed for registration.' });
    }
    
    try {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      
      const client = await this.fastify.pg.connect();
      try {
        const result = await client.query(
          'INSERT INTO users (email, password, role, status) VALUES ($1, $2, $3, $4) RETURNING id, email, role, status, created_at',
          [sanitizedEmail, hashedPassword, role, 'active']
        );
        
        const user = result.rows[0];
        
        const token = this.fastify.jwt.sign({ 
          id: user.id,
          email: user.email, 
          role: user.role 
        });

        await this.notificationModel.notifyAdmins(
          `New user registered: ${sanitizedEmail} (${role}) - Account auto-approved`,
          'user',
          '👤 New User Registration'
        );

        await this.notificationModel.create(
          user.id,
          'Welcome! Your account has been created and is ready to use. You can start scanning now.',
          'success',
          '🎉 Welcome to CyberTrace'
        );
        
        return { 
          success: true, 
          token, 
          user,
          message: 'Registration successful. Your account is ready to use.' 
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
    
    // Sanitize inputs
    const sanitizedEmail = validator.sanitizeString(email, 255).toLowerCase();
    
    try {
      const user = await this.userModel.findByEmail(sanitizedEmail);
      
      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

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

      if (user.role !== 'admin') {
        await this.notificationModel.notifyAdmins(
          `User ${sanitizedEmail} (${user.role}) logged in`,
          'user',
          '🔐 User Login'
        );
      }

      await this.notificationModel.create(
        user.id,
        'You have successfully logged in to your account.',
        'info',
        '🔐 Login Successful'
      );
      
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

  async forgotPassword(request, reply) {
    const { email } = request.body || {};
    const sanitizedEmail = validator.sanitizeString(email, 255).toLowerCase();

    try {
      const user = await this.userModel.findByEmail(sanitizedEmail);
      
      if (!user) {
        return { success: true, message: 'If email exists, reset link sent' };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

      await this.userModel.saveResetToken(user.id, resetToken, resetTokenExpires);

      // In production, send email here
      console.log(`Reset token for ${sanitizedEmail}: ${resetToken}`);
      console.log(`Reset URL: ${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`);

      await this.notificationModel.create(
        user.id,
        `Password reset requested. Token expires in 1 hour.`,
        'info',
        '🔑 Password Reset'
      );

      return { success: true, message: 'If email exists, reset link sent' };
    } catch (error) {
      console.error('Forgot password error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  async resetPassword(request, reply) {
    const { token, password } = request.body || {};

    if (!token || !password) {
      return reply.code(400).send({ error: 'Token and password required' });
    }

    try {
      const user = await this.userModel.findByResetToken(token);

      if (!user || new Date() > new Date(user.reset_token_expires)) {
        return reply.code(400).send({ error: 'Invalid or expired token' });
      }

      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      await this.userModel.updatePassword(user.id, hashedPassword);
      await this.userModel.clearResetToken(user.id);

      await this.notificationModel.create(
        user.id,
        'Your password has been successfully reset.',
        'success',
        '✅ Password Changed'
      );

      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      console.error('Reset password error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;