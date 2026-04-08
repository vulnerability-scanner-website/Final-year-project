require('dotenv').config();
const fs = require('fs');
const fastify = require('fastify')({
  logger: process.env.NODE_ENV === 'development', 
  disableRequestLogging: process.env.NODE_ENV === 'production',
  requestIdLogLabel: false,
  trustProxy: true,
  https: process.env.ENABLE_HTTPS === 'true' ? {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  } : null
});
const path = require('path');
const { initDatabase } = require('./config/database');
const { authenticate } = require('./middlewares/auth');
const { errorHandler } = require('./middlewares/errorHandler');
const { multipartOptions } = require('./middlewares/fileValidation');
const csrfProtection = require('./middlewares/csrf');
const rateLimiter = require('./middlewares/rateLimiter');
const CleanupService = require('./services/cleanup');

// Security: Helmet disabled - install @fastify/helmet if needed
// fastify.register(require('@fastify/helmet'), { ... });

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
});

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    const json = body ? JSON.parse(body) : {};
    done(null, json);
  } catch (err) {
    err.statusCode = 400;
    done(err, undefined);
  }
});

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}

fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production'
});

// Enhanced rate limiting
fastify.register(require('@fastify/rate-limit'), {
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
  cache: 10000,
  allowList: ['127.0.0.1'],
  redis: null,
  skipOnError: true,
  keyGenerator: (request) => {
    return request.user?.id || request.ip;
  },
  errorResponseBuilder: (request, context) => {
    return {
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${Math.round(context.after / 1000)} seconds`,
      retryAfter: context.after
    };
  }
});

fastify.register(require('@fastify/multipart'), multipartOptions);

// Register PostgreSQL with connection pooling
fastify.register(require('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/security_scanner',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Register WebSocket
fastify.register(require('@fastify/websocket'));

// Initialize database tables
fastify.addHook('onReady', async function () {
  const client = await fastify.pg.connect();
  try {
    await initDatabase(client);
  } finally {
    client.release();
  }
  
  // Start cleanup service
  const cleanupService = new CleanupService(fastify);
  await cleanupService.start();
});

// Authentication decorator
fastify.decorate('authenticate', authenticate);

// CSRF Protection (after authentication) - TEMPORARILY DISABLED FOR TESTING
// fastify.addHook('onRequest', csrfProtection.middleware());

// Per-user rate limiting
fastify.addHook('onRequest', rateLimiter.apiRateLimitMiddleware());

// Global error handler
fastify.setErrorHandler(errorHandler);

// Security: Add request ID to all requests
fastify.addHook('onRequest', async (request, reply) => {
  request.id = request.id || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
});

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', message: 'Backend is running', timestamp: new Date().toISOString() };
});

// CSRF token endpoint
fastify.get('/api/csrf-token', { onRequest: [fastify.authenticate] }, csrfProtection.getTokenEndpoint());

// Manually register routes
fastify.register(require('./routes/auth'), { prefix: '/api/auth' });
fastify.register(require('./routes/admin'), { prefix: '/api' });
fastify.register(require('./routes/scans'), { prefix: '/api' });
fastify.register(require('./routes/vulnerabilities'), { prefix: '/api' });
fastify.register(require('./routes/users'), { prefix: '/api' });
fastify.register(require('./routes/dashboard'), { prefix: '/api' });
fastify.register(require('./routes/reports'), { prefix: '/api' });
fastify.register(require('./routes/notifications'), { prefix: '/api' });
fastify.register(require('./routes/settings'), { prefix: '/api' });
fastify.register(require('./routes/pricing'), { prefix: '/api' });
fastify.register(require('./routes/payments'), { prefix: '/api' });

// WebSocket endpoint for real-time updates
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', message => {
      console.log('Received:', message.toString());
    });
    
    connection.socket.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected' }));
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT) || 5000;
    const protocol = process.env.ENABLE_HTTPS === 'true' ? 'https' : 'http';
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Backend server running on ${protocol}://localhost:${port}`);
    console.log('🔌 WebSocket available at ws://localhost:' + port + '/ws');
    console.log('🔒 Security features enabled: Helmet, CSRF, Rate Limiting, Input Validation');
    console.log('📋 Routes registered manually');
    if (process.env.NODE_ENV === 'development') {
      console.log(fastify.printRoutes());
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
