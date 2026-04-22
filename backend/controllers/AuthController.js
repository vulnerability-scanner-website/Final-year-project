const bcrypt = require('bcrypt');
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

      // Check if user registered with Google
      if (user.auth_provider === 'google') {
        return reply.code(400).send({ error: 'This account uses Google login. Please sign in with Google.' });
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

  async googleCallback(request, reply) {
    console.log('=== googleCallback method started ===');
    console.log('User from request:', request.user);
    
    try {
      const { email, googleId } = request.user;
      console.log('Email:', email, 'GoogleId:', googleId);
      
      let user = await this.userModel.findByGoogleId(googleId);
      console.log('User found by googleId:', user);
      
      if (!user) {
        user = await this.userModel.findByEmail(email);
        console.log('User found by email:', user);
        
        if (user && user.auth_provider === 'local') {
          console.log('User exists with local auth');
          return reply.code(400).send({ 
            error: 'An account with this email already exists. Please login with email and password.' 
          });
        }
        
        if (!user) {
          console.log('Creating new user');
          user = await this.userModel.create(email, null, 'developer', 'google', googleId);
          console.log('New user created:', user);
          
          await this.notificationModel.notifyAdmins(
            `New user registered via Google: ${email} (developer) - Account auto-approved`,
            'user',
            '👤 New Google User Registration'
          );

          await this.notificationModel.create(
            user.id,
            'Welcome! Your account has been created via Google and is ready to use.',
            'success',
            '🎉 Welcome to CyberTrace'
          );
        }
      }

      if (user.status !== 'active') {
        console.log('User not active');
        return reply.code(403).send({ 
          error: 'Account not active. Please contact support.' 
        });
      }
      
      console.log('Generating JWT token');
      const token = this.fastify.jwt.sign({ 
        id: user.id,
        email: user.email, 
        role: user.role 
      });
      console.log('Token generated');

      if (user.role !== 'admin') {
        await this.notificationModel.notifyAdmins(
          `User ${email} (${user.role}) logged in via Google`,
          'user',
          '🔐 Google Login'
        );
      }

      await this.notificationModel.create(
        user.id,
        'You have successfully logged in via Google.',
        'info',
        '🔐 Login Successful'
      );

      const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/success?token=${token}&role=${user.role}`;
      console.log('Redirecting to:', redirectUrl);
      return reply.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      console.error('Error stack:', error.stack);
      return reply.redirect(`${process.env.FRONTEND_URL}/auth/login?error=google_auth_failed`);
    }
  }
}

module.exports = AuthController;