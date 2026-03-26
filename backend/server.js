const fastify = require('fastify')({
  logger: false, 
  disableRequestLogging: true,
  requestIdLogLabel: false
});
const path = require('path');
const { initDatabase } = require('./config/database');
const { authenticate } = require('./middlewares/auth');
const CleanupService = require('./services/cleanup');

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production'
});

fastify.register(require('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute'
});

fastify.register(require('@fastify/multipart'));

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

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', message: 'Backend is running' };
});

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
    await fastify.listen({ port: 5000, host: '0.0.0.0' });
    console.log('🚀 Backend server running on http://localhost:5000');
    console.log('🔌 WebSocket available at ws://localhost:5000/ws');
    console.log('📋 Routes registered manually');
    console.log(fastify.printRoutes()); // Print all registered routes
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
