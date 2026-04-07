const crypto = require('crypto');

class CSRFProtection {
  constructor() {
    this.tokens = new Map();
    this.secret = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
  }

  generateToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();
    
    this.tokens.set(token, { userId, timestamp });
    
    // Clean up old tokens (older than 1 hour)
    this.cleanupOldTokens();
    
    return token;
  }

  validateToken(token, userId) {
    if (!token) return false;
    
    const tokenData = this.tokens.get(token);
    if (!tokenData) return false;
    
    // Check if token belongs to user
    if (tokenData.userId !== userId) return false;
    
    // Check if token is expired (1 hour)
    const isExpired = Date.now() - tokenData.timestamp > 3600000;
    if (isExpired) {
      this.tokens.delete(token);
      return false;
    }
    
    return true;
  }

  cleanupOldTokens() {
    const now = Date.now();
    for (const [token, data] of this.tokens.entries()) {
      if (now - data.timestamp > 3600000) {
        this.tokens.delete(token);
      }
    }
  }

  middleware() {
    return async (request, reply) => {
      // Skip CSRF for GET, HEAD, OPTIONS
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        return;
      }

      // Skip CSRF for auth endpoints (login/register)
      if (request.url.includes('/api/auth/login') || request.url.includes('/api/auth/register')) {
        return;
      }

      // Skip CSRF for health check
      if (request.url === '/health') {
        return;
      }

      const token = request.headers['x-csrf-token'];
      const userId = request.user?.id;

      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      if (!this.validateToken(token, userId)) {
        return reply.code(403).send({ error: 'Invalid or missing CSRF token' });
      }
    };
  }

  getTokenEndpoint() {
    return async (request, reply) => {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      
      const token = this.generateToken(request.user.id);
      return { csrfToken: token };
    };
  }
}

const csrfProtection = new CSRFProtection();

module.exports = csrfProtection;
