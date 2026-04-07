const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔒 Security Setup Script\n');

// Generate secure secrets
const jwtSecret = crypto.randomBytes(32).toString('hex');
const csrfSecret = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated secure secrets');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Skipping creation.');
  console.log('   If you want to regenerate, delete .env and run this script again.\n');
} else {
  // Read .env.example
  let envContent = fs.readFileSync(envExamplePath, 'utf-8');
  
  // Replace secrets
  envContent = envContent.replace(
    'JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars',
    `JWT_SECRET=${jwtSecret}`
  );
  envContent = envContent.replace(
    'CSRF_SECRET=your-csrf-secret-key-change-this-in-production',
    `CSRF_SECRET=${csrfSecret}`
  );
  
  // Write .env
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with secure secrets\n');
}

console.log('📋 Next Steps:');
console.log('1. Review and update .env file with your configuration');
console.log('2. Set DATABASE_URL to your PostgreSQL connection string');
console.log('3. Update FRONTEND_URL to your frontend URL');
console.log('4. For production, enable HTTPS and set SSL certificate paths');
console.log('5. Install dependencies: npm install');
console.log('6. Start server: npm start\n');

console.log('🔐 Security Features Enabled:');
console.log('✓ Environment variables for secrets');
console.log('✓ Input validation on all endpoints');
console.log('✓ CSRF protection');
console.log('✓ Rate limiting per user/plan');
console.log('✓ SQL injection prevention');
console.log('✓ Secure file upload validation');
console.log('✓ Security headers (Helmet)');
console.log('✓ Proper error handling (no stack traces in production)');
console.log('✓ Input sanitization\n');

console.log('📚 Read SECURITY.md for detailed documentation\n');
