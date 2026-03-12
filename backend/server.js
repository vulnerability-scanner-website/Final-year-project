const fastify = require('fastify')({ logger: true });
const path = require('path');
const { initDatabase } = require('./config/database');
const { authenticate } = require('./middlewares/auth');

// Register plugins
// CORS configuration for Railway deployment
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  /\.railway\.app$/,  // Allow all Railway domains
  /\.up\.railway\.app$/  // Allow all Railway up domains
].filter(Boolean);

fastify.register(require('@fastify/cors'), {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Allow requests with no origin (mobile apps, curl, etc.)
    
    const allowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    cb(null, allowed);
  },
  credentials: true
});

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    const json = JSON.parse(body);
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

// Register PostgreSQL
fastify.register(require('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/security_scanner'
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
});

// Authentication decorator
fastify.decorate('authenticate', authenticate);

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', message: 'Backend is running' };
});

// Manually register routes
fastify.register(require('./routes/auth'), { prefix: '/api/auth' });
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
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';
    
    await fastify.ready(); // Wait for all plugins and routes to be registered
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Backend server running on http://${HOST}:${PORT}`);
    console.log(`🔌 WebSocket available at ws://${HOST}:${PORT}/ws`);
    console.log('📁 Routes registered manually');
    console.log(fastify.printRoutes()); // Print all registered routes
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
