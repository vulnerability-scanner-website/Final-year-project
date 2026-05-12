const bcrypt = require('bcrypt');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const UserModel = require('../models/User');
const NotificationModel = require('../models/Notification');
const EmailService = require('../services/emailService');
const { validator } = require('../middlewares/validation');

class AuthController {
  constructor(fastify) {
    this.fastify = fastify;
    this.userModel = new UserModel(fastify.pg);
    this.notificationModel = new NotificationModel(fastify.pg);
    this.emailService = new EmailService();
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
      
      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `CyberTrace (${sanitizedEmail})`,
        issuer: 'CyberTrace Security'
      });
      
      const totpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes to verify
      
      const client = await this.fastify.pg.connect();
      try {
        const result = await client.query(
          `INSERT INTO users (email, password, role, status, email_verified, verification_token, verification_token_expires) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING id, email, role, status, email_verified, created_at`,
          [sanitizedEmail, hashedPassword, role, 'pending', false, secret.base32, totpExpires]
        );
        
        const user = result.rows[0];
        
        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        await this.notificationModel.notifyAdmins(
          `New user registered: ${sanitizedEmail} (${role}) - Awaiting 2FA verification`,
          'user',
          '👤 New User Registration'
        );
        
        return { 
          success: true, 
          message: 'Registration successful! Scan the QR code with your authenticator app.',
          email: sanitizedEmail,
          qrCode: qrCodeUrl,
          secret: secret.base32,
          requiresVerification: true
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
      
      if (!email || !googleId) {
        console.error('Missing email or googleId');
        throw new Error('Missing email or googleId from Google');
      }
      
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
          console.log('Creating new user with analyst role');
          user = await this.userModel.create(email, null, 'analyst', 'google', googleId);
          console.log('New user created:', user);
          
          await this.notificationModel.notifyAdmins(
            `New user registered via Google: ${email} (analyst) - Account auto-approved`,
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
      console.log('Token generated:', token);

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

  async verifyEmail(request, reply) {
    const { token, code } = request.body || {};

    if (!code) {
      return reply.code(400).send({ error: 'Verification code required' });
    }

    try {
      const client = await this.fastify.pg.connect();
      try {
        // Find user by email or token
        const result = await client.query(
          'SELECT id, email, verification_token, verification_token_expires FROM users WHERE verification_token IS NOT NULL AND email_verified = FALSE'
        );

        let user = null;
        for (const row of result.rows) {
          // Verify TOTP code
          const verified = speakeasy.totp.verify({
            secret: row.verification_token,
            encoding: 'base32',
            token: code,
            window: 2
          });

          if (verified) {
            user = row;
            break;
          }
        }

        if (!user) {
          return reply.code(400).send({ error: 'Invalid verification code' });
        }

        // Check if token expired
        if (new Date() > new Date(user.verification_token_expires)) {
          return reply.code(400).send({ error: 'Verification code has expired. Please register again.' });
        }

        // Update user: verify email and activate account
        await client.query(
          `UPDATE users 
           SET email_verified = TRUE, 
               status = 'active', 
               verification_token = NULL, 
               verification_token_expires = NULL 
           WHERE id = $1`,
          [user.id]
        );

        await this.notificationModel.notifyAdmins(
          `User ${user.email} verified their email and account is now active`,
          'success',
          '✅ Email Verified'
        );

        await this.notificationModel.create(
          user.id,
          'Your email has been verified! You can now log in to your account.',
          'success',
          '🎉 Email Verified'
        );

        return { 
          success: true, 
          message: 'Email verified successfully! You can now log in to your account.' 
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  async resendVerification(request, reply) {
    const { email } = request.body || {};
    const sanitizedEmail = validator.sanitizeString(email, 255).toLowerCase();

    try {
      const client = await this.fastify.pg.connect();
      try {
        const result = await client.query(
          'SELECT id, email, email_verified FROM users WHERE email = $1',
          [sanitizedEmail]
        );

        if (result.rows.length === 0) {
          // Don't reveal if email exists
          return { success: true, message: 'If the email exists, a verification link has been sent.' };
        }

        const user = result.rows[0];

        if (user.email_verified) {
          return reply.code(400).send({ error: 'Email is already verified' });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 3600000); // 24 hours

        await client.query(
          'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
          [verificationToken, verificationExpires, user.id]
        );

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
        
        const emailResult = await this.emailService.sendVerificationEmail(sanitizedEmail, verificationUrl);
        
        if (!emailResult.success) {
          console.error('Failed to send verification email:', emailResult.error);
          // Still log the URL as fallback
          console.log(`\n=== RESEND EMAIL VERIFICATION (Fallback) ===`);
          console.log(`To: ${sanitizedEmail}`);
          console.log(`Verification URL: ${verificationUrl}`);
          console.log(`============================================\n`);
        }

        return { 
          success: true, 
          message: 'Verification email sent! Please check your inbox.' 
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;