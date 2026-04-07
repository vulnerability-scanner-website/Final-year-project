# Security Implementation Guide

## ✅ Implemented Security Features

### 1. Environment Variables for Secrets
- **Location**: `.env.example` (template file)
- **Implementation**: All sensitive data moved to environment variables
- **Variables**:
  - `JWT_SECRET`: JWT token signing secret
  - `DATABASE_URL`: Database connection string
  - `CSRF_SECRET`: CSRF token secret
  - `BCRYPT_SALT_ROUNDS`: Password hashing rounds
  - `SSL_KEY_PATH` & `SSL_CERT_PATH`: SSL certificate paths

**Setup**:
```bash
cp .env.example .env
# Edit .env with your actual values
```

### 2. Input Validation
- **Location**: `middlewares/validation.js`
- **Implementation**: Comprehensive validation schemas for all endpoints
- **Features**:
  - Email format validation
  - URL validation
  - String length limits
  - Type checking
  - Enum validation
  - Pattern matching

**Usage**:
```javascript
const { validateInput, schemas } = require('../middlewares/validation');

fastify.post('/endpoint', { 
  preHandler: validateInput(schemas.register) 
}, handler);
```

### 3. HTTPS/SSL Support
- **Location**: `server.js`
- **Implementation**: Conditional HTTPS based on environment variable
- **Configuration**:
  ```env
  ENABLE_HTTPS=true
  SSL_KEY_PATH=/path/to/key.pem
  SSL_CERT_PATH=/path/to/cert.pem
  ```

**Generate Self-Signed Certificate (Development)**:
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### 4. CSRF Protection
- **Location**: `middlewares/csrf.js`
- **Implementation**: Token-based CSRF protection
- **Features**:
  - Token generation per user
  - Token validation on state-changing requests
  - Automatic token expiration (1 hour)
  - Skips GET, HEAD, OPTIONS requests

**Client Usage**:
```javascript
// 1. Get CSRF token
const { csrfToken } = await fetch('/api/csrf-token', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// 2. Include in requests
fetch('/api/scans', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### 5. Input Sanitization
- **Location**: `middlewares/validation.js`
- **Implementation**: HTML/XSS sanitization utilities
- **Functions**:
  - `sanitizeString()`: Remove dangerous characters
  - `sanitizeHtml()`: Escape HTML entities
- **Applied to**: All user inputs in controllers

### 6. SQL Injection Prevention
- **Location**: `utils/sqlHelper.js`
- **Implementation**: Parameterized queries and identifier validation
- **Features**:
  - Identifier sanitization
  - Safe query building
  - ID validation
  - Always uses parameterized queries

**Usage**:
```javascript
const SQLHelper = require('../utils/sqlHelper');

// Validate ID
const userId = SQLHelper.validateId(request.params.id);

// Use parameterized queries
await client.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### 7. Error Handling
- **Location**: `middlewares/errorHandler.js`
- **Implementation**: Global error handler
- **Features**:
  - No stack traces in production
  - Generic error messages in production
  - Detailed errors in development
  - Proper HTTP status codes
  - Error logging

### 8. Rate Limiting
- **Location**: `middlewares/rateLimiter.js`
- **Implementation**: Per-user and per-plan rate limiting
- **Limits**:
  - **Free**: 5 scans/day, 50 API requests/hour
  - **Basic**: 20 scans/day, 200 API requests/hour
  - **Premium**: 100 scans/day, 1000 API requests/hour
  - **Enterprise**: Unlimited scans, 5000 API requests/hour

### 9. File Upload Validation
- **Location**: `middlewares/fileValidation.js`
- **Implementation**: Secure file upload handling
- **Features**:
  - File type validation (whitelist)
  - MIME type verification
  - File size limits (10MB default)
  - Filename sanitization
  - Malicious content detection
  - Path traversal prevention

**Allowed Types**: PDF, JSON, TXT, CSV, XLSX

### 10. Security Headers (Helmet)
- **Location**: `server.js`
- **Implementation**: @fastify/helmet plugin
- **Headers**:
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security
  - X-XSS-Protection

## 🔒 Security Best Practices

### Production Checklist
- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Set strong `CSRF_SECRET`
- [ ] Enable HTTPS (`ENABLE_HTTPS=true`)
- [ ] Set `NODE_ENV=production`
- [ ] Use strong database password
- [ ] Configure proper CORS origins
- [ ] Review rate limits for your use case
- [ ] Set up SSL certificates
- [ ] Enable database SSL connection
- [ ] Regular security audits
- [ ] Keep dependencies updated

### Password Requirements
- Minimum 8 characters
- Hashed with bcrypt (10 rounds default)
- Never logged or exposed

### API Security
- All endpoints require authentication (except login/register)
- CSRF tokens required for state-changing operations
- Rate limiting per user and plan
- Input validation on all endpoints
- SQL injection prevention with parameterized queries

### Database Security
- Parameterized queries only
- Connection pooling
- SSL connections in production
- Regular backups
- Principle of least privilege

## 🚀 Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Generate SSL certificates (production):
```bash
# Use Let's Encrypt or your certificate provider
certbot certonly --standalone -d yourdomain.com
```

4. Start server:
```bash
# Development
npm run dev

# Production
NODE_ENV=production npm start
```

## 🧪 Testing Security

### Test CSRF Protection
```bash
# Should fail without CSRF token
curl -X POST http://localhost:5000/api/scans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target":"http://example.com"}'
```

### Test Rate Limiting
```bash
# Make multiple requests quickly
for i in {1..60}; do
  curl http://localhost:5000/api/scans \
    -H "Authorization: Bearer YOUR_TOKEN"
done
```

### Test Input Validation
```bash
# Should fail with invalid email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"test123","role":"developer"}'
```

## 📝 Maintenance

### Update Dependencies
```bash
npm audit
npm audit fix
npm update
```

### Monitor Logs
- Check for suspicious activity
- Monitor rate limit violations
- Review error logs
- Track failed authentication attempts

### Regular Tasks
- Rotate JWT secrets periodically
- Review and update rate limits
- Update SSL certificates before expiry
- Database security patches
- Dependency updates

## 🆘 Incident Response

If a security breach is detected:
1. Immediately rotate all secrets (JWT, CSRF, database passwords)
2. Review logs for unauthorized access
3. Notify affected users
4. Patch the vulnerability
5. Conduct security audit
6. Update security documentation

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Fastify Security Best Practices](https://www.fastify.io/docs/latest/Guides/Security/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
