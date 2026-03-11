const fastify = require('fastify')({ logger: true });
const bcrypt = require('bcrypt');

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: 'http://localhost:3000',
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
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS scans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        target VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        issues INTEGER DEFAULT 0,
        date DATE DEFAULT CURRENT_DATE,
        duration VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        size DECIMAL(10,2),
        status VARCHAR(50) NOT NULL,
        subtype VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create default admin user if not exists
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (email, password, role)
      VALUES ('admin@security.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [hashedPassword]);
    
    console.log('✅ Database initialized');
  } finally {
    client.release();
  }
});

// Authentication decorator
fastify.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Health check
fastify.get('/api/health', async (request, reply) => {
  return { status: 'ok', message: 'Backend is running' };
});

// Register endpoint
fastify.post('/api/register', async (request, reply) => {
  console.log('Register request body:', request.body);
  const { email, password, role } = request.body || {};
  
  console.log('Register attempt:', { email, passwordLength: password?.length, role });
  
  if (!email || !password || !role) {
    console.log('Missing required fields');
    return reply.code(400).send({ error: 'Missing required fields' });
  }
  
  const client = await fastify.pg.connect();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, role]
    );
    
    const token = fastify.jwt.sign({ 
      id: result.rows[0].id,
      email: result.rows[0].email, 
      role: result.rows[0].role 
    });
    
    return { success: true, token, user: result.rows[0] };
  } catch (err) {
    if (err.code === '23505') {
      return reply.code(409).send({ error: 'Email already exists' });
    }
    throw err;
  } finally {
    client.release();
  }
});

// Login endpoint
fastify.post('/api/login', async (request, reply) => {
  console.log('Raw body:', request.body);
  const { email, password } = request.body || {};
  
  console.log('Login attempt:', { email, passwordLength: password?.length });
  
  if (!email || !password) {
    console.log('Missing credentials');
    return reply.code(400).send({ error: 'Missing email or password' });
  }
  
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    console.log('User found:', result.rows.length > 0);
    
    if (result.rows.length === 0) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    console.log('Password valid:', validPassword);
    
    if (!validPassword) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    
    const token = fastify.jwt.sign({ 
      id: user.id,
      email: user.email, 
      role: user.role 
    });
    
    return { 
      success: true, 
      token, 
      user: { id: user.id, email: user.email, role: user.role } 
    };
  } finally {
    client.release();
  }
});

// Get scans (protected)
fastify.get('/api/scans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'SELECT * FROM scans WHERE user_id = $1 ORDER BY created_at DESC',
      [request.user.id]
    );
    return result.rows;
  } finally {
    client.release();
  }
});

// Create scan (protected)
fastify.post('/api/scans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const { target } = request.body;
  
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'INSERT INTO scans (user_id, target, status, issues, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [request.user.id, target, 'Running', 0, '-']
    );
    
    // Broadcast to WebSocket clients
    fastify.websocketServer.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'scan_started', data: result.rows[0] }));
      }
    });
    
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Get reports (protected)
fastify.get('/api/reports', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
      [request.user.id]
    );
    return result.rows;
  } finally {
    client.release();
  }
});

// ==================== USER MANAGEMENT (ADMIN) ====================

// Get all users (admin only)
fastify.get('/api/users', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  if (request.user.role !== 'admin') {
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
});

// Get user by ID (admin only)
fastify.get('/api/users/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  if (request.user.role !== 'admin') {
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT id, email, role, created_at FROM users WHERE id = $1', [request.params.id]);
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Update user (admin only)
fastify.put('/api/users/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  if (request.user.role !== 'admin') {
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const { email, role } = request.body;
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'UPDATE users SET email = $1, role = $2 WHERE id = $3 RETURNING id, email, role',
      [email, role, request.params.id]
    );
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Delete user (admin only)
fastify.delete('/api/users/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  if (request.user.role !== 'admin') {
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [request.params.id]);
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }
    return { success: true, message: 'User deleted' };
  } finally {
    client.release();
  }
});

// Get user statistics (admin only)
fastify.get('/api/users/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  if (request.user.role !== 'admin') {
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const client = await fastify.pg.connect();
  try {
    const totalUsers = await client.query('SELECT COUNT(*) FROM users');
    const usersByRole = await client.query('SELECT role, COUNT(*) FROM users GROUP BY role');
    return {
      total: parseInt(totalUsers.rows[0].count),
      byRole: usersByRole.rows
    };
  } finally {
    client.release();
  }
});

// ==================== SCAN MANAGEMENT ====================

// Get scan by ID
fastify.get('/api/scans/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT * FROM scans WHERE id = $1', [request.params.id]);
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Scan not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Update scan status
fastify.put('/api/scans/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const { status, issues } = request.body;
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'UPDATE scans SET status = $1, issues = $2 WHERE id = $3 RETURNING *',
      [status, issues, request.params.id]
    );
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Scan not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Delete scan
fastify.delete('/api/scans/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('DELETE FROM scans WHERE id = $1 RETURNING id', [request.params.id]);
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Scan not found' });
    }
    return { success: true, message: 'Scan deleted' };
  } finally {
    client.release();
  }
});

// Pause scan
fastify.post('/api/scans/:id/pause', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'UPDATE scans SET status = $1 WHERE id = $2 RETURNING *',
      ['Paused', request.params.id]
    );
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Scan not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Resume scan
fastify.post('/api/scans/:id/resume', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'UPDATE scans SET status = $1 WHERE id = $2 RETURNING *',
      ['Running', request.params.id]
    );
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Scan not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Stop scan
fastify.post('/api/scans/:id/stop', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'UPDATE scans SET status = $1 WHERE id = $2 RETURNING *',
      ['Stopped', request.params.id]
    );
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Scan not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Get scan vulnerabilities
fastify.get('/api/scans/:id/vulnerabilities', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT * FROM vulnerabilities WHERE scan_id = $1', [request.params.id]);
    return result.rows;
  } finally {
    client.release();
  }
});

// ==================== VULNERABILITIES ====================

// Get all vulnerabilities
fastify.get('/api/vulnerabilities', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT * FROM vulnerabilities ORDER BY created_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
});

// Get vulnerability by ID
fastify.get('/api/vulnerabilities/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT * FROM vulnerabilities WHERE id = $1', [request.params.id]);
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Vulnerability not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Update vulnerability status
fastify.put('/api/vulnerabilities/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const { status } = request.body;
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'UPDATE vulnerabilities SET status = $1 WHERE id = $2 RETURNING *',
      [status, request.params.id]
    );
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Vulnerability not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// ==================== REPORTS ====================

// Create report
fastify.post('/api/reports', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const { name, type, subtype } = request.body;
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'INSERT INTO reports (user_id, name, type, status, subtype, size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [request.user.id, name, type, 'Generated', subtype, 0]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Get report by ID
fastify.get('/api/reports/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT * FROM reports WHERE id = $1', [request.params.id]);
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Report not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Delete report
fastify.delete('/api/reports/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('DELETE FROM reports WHERE id = $1 RETURNING id', [request.params.id]);
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Report not found' });
    }
    return { success: true, message: 'Report deleted' };
  } finally {
    client.release();
  }
});

// Download report
fastify.get('/api/reports/:id/download', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT * FROM reports WHERE id = $1', [request.params.id]);
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Report not found' });
    }
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename="${result.rows[0].name}.pdf"`);
    return { message: 'Report download initiated' };
  } finally {
    client.release();
  }
});

// ==================== NOTIFICATIONS ====================

// Get user notifications
fastify.get('/api/notifications', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [request.user.id]);
    return result.rows;
  } finally {
    client.release();
  }
});

// Mark notification as read
fastify.put('/api/notifications/:id/read', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [request.params.id, request.user.id]
    );
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Notification not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Delete notification
fastify.delete('/api/notifications/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id', [request.params.id, request.user.id]);
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Notification not found' });
    }
    return { success: true, message: 'Notification deleted' };
  } finally {
    client.release();
  }
});

// ==================== DASHBOARD STATISTICS ====================

// Get dashboard stats
fastify.get('/api/dashboard/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const totalScans = await client.query('SELECT COUNT(*) FROM scans WHERE user_id = $1', [request.user.id]);
    const activeScans = await client.query('SELECT COUNT(*) FROM scans WHERE user_id = $1 AND status = $2', [request.user.id, 'Running']);
    const totalVulnerabilities = await client.query('SELECT COUNT(*) FROM vulnerabilities v JOIN scans s ON v.scan_id = s.id WHERE s.user_id = $1', [request.user.id]);
    return {
      totalScans: parseInt(totalScans.rows[0].count),
      activeScans: parseInt(activeScans.rows[0].count),
      totalVulnerabilities: parseInt(totalVulnerabilities.rows[0].count)
    };
  } finally {
    client.release();
  }
});

// Get recent scans
fastify.get('/api/dashboard/recent-scans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT * FROM scans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [request.user.id]);
    return result.rows;
  } finally {
    client.release();
  }
});

// Get vulnerabilities summary
fastify.get('/api/dashboard/vulnerabilities-summary', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'SELECT severity, COUNT(*) FROM vulnerabilities v JOIN scans s ON v.scan_id = s.id WHERE s.user_id = $1 GROUP BY severity',
      [request.user.id]
    );
    return result.rows;
  } finally {
    client.release();
  }
});

// ==================== SETTINGS ====================

// Get user settings
fastify.get('/api/settings', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT * FROM settings WHERE user_id = $1', [request.user.id]);
    return result.rows[0] || {};
  } finally {
    client.release();
  }
});

// Update settings
fastify.put('/api/settings', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const settings = request.body;
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'INSERT INTO settings (user_id, data) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET data = $2 RETURNING *',
      [request.user.id, JSON.stringify(settings)]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Generate API key
fastify.post('/api/settings/api-key', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const apiKey = require('crypto').randomBytes(32).toString('hex');
  const client = await fastify.pg.connect();
  try {
    await client.query('UPDATE users SET api_key = $1 WHERE id = $2', [apiKey, request.user.id]);
    return { apiKey };
  } finally {
    client.release();
  }
});

// Change password
fastify.put('/api/settings/password', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const { currentPassword, newPassword } = request.body;
  const client = await fastify.pg.connect();
  try {
    const user = await client.query('SELECT password FROM users WHERE id = $1', [request.user.id]);
    const validPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
    if (!validPassword) {
      return reply.code(401).send({ error: 'Invalid current password' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, request.user.id]);
    return { success: true, message: 'Password updated' };
  } finally {
    client.release();
  }
});

// ==================== PRICING (ADMIN) ====================

// Get pricing plans
fastify.get('/api/pricing', async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('SELECT * FROM pricing ORDER BY price ASC');
    return result.rows;
  } finally {
    client.release();
  }
});

// Create pricing plan (admin only)
fastify.post('/api/pricing', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  if (request.user.role !== 'admin') {
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const { name, price, features } = request.body;
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'INSERT INTO pricing (name, price, features) VALUES ($1, $2, $3) RETURNING *',
      [name, price, JSON.stringify(features)]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Update pricing plan (admin only)
fastify.put('/api/pricing/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  if (request.user.role !== 'admin') {
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const { name, price, features } = request.body;
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      'UPDATE pricing SET name = $1, price = $2, features = $3 WHERE id = $4 RETURNING *',
      [name, price, JSON.stringify(features), request.params.id]
    );
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Pricing plan not found' });
    }
    return result.rows[0];
  } finally {
    client.release();
  }
});

// Delete pricing plan (admin only)
fastify.delete('/api/pricing/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  if (request.user.role !== 'admin') {
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const client = await fastify.pg.connect();
  try {
    const result = await client.query('DELETE FROM pricing WHERE id = $1 RETURNING id', [request.params.id]);
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Pricing plan not found' });
    }
    return { success: true, message: 'Pricing plan deleted' };
  } finally {
    client.release();
  }
});

// WebSocket endpoint for real-time updates
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', message => {
      console.log('Received:', message.toString());
    });
    
    // Send initial connection message
    connection.socket.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected' }));
  });
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 5000, host: '0.0.0.0' });
    console.log('🚀 Backend server running on http://localhost:5000');
    console.log('🔌 WebSocket available at ws://localhost:5000/ws');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
