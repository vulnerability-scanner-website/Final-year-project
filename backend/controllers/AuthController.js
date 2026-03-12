const bcrypt = require('bcrypt');
const UserModel = require('../models/User');

class AuthController {
  constructor(fastify) {
    this.fastify = fastify;
    this.userModel = new UserModel(fastify.pg);
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
        
        return { 
          success: true, 
          token, 
          user,
          message: 'Registration successful. Your account is pending require admin approval.' 
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
      
      const token = this.fastify.jwt.sign({ 
        id: user.id,
        email: user.email, 
        role: user.role 
      });
      
      return { 
        success: true, 
        token, 
        user: { id: user.id, email: user.email, role: user.role } 
      };
    } catch (error) {
      console.error('Login error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;
