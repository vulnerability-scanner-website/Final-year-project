const bcrypt = require('bcrypt');

const initDatabase = async (client) => {
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration: Add status column if it doesn't exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='status'
        ) THEN
          ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        END IF;
      END $$;
    `);

    await client.query(`
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

      CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
      CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
      CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);

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

      CREATE TABLE IF NOT EXISTS vulnerabilities (
        id SERIAL PRIMARY KEY,
        scan_id INTEGER REFERENCES scans(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Open',
        description TEXT,
        affected_url VARCHAR(500),
        affected_parameter VARCHAR(255),
        evidence TEXT,
        remediation TEXT,
        cwe_id VARCHAR(50),
        cvss_score DECIMAL(3,1),
        scanner_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vulnerabilities' AND column_name='affected_url') THEN
          ALTER TABLE vulnerabilities ADD COLUMN affected_url VARCHAR(500);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vulnerabilities' AND column_name='affected_parameter') THEN
          ALTER TABLE vulnerabilities ADD COLUMN affected_parameter VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vulnerabilities' AND column_name='evidence') THEN
          ALTER TABLE vulnerabilities ADD COLUMN evidence TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vulnerabilities' AND column_name='remediation') THEN
          ALTER TABLE vulnerabilities ADD COLUMN remediation TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vulnerabilities' AND column_name='cwe_id') THEN
          ALTER TABLE vulnerabilities ADD COLUMN cwe_id VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vulnerabilities' AND column_name='cvss_score') THEN
          ALTER TABLE vulnerabilities ADD COLUMN cvss_score DECIMAL(3,1);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vulnerabilities' AND column_name='scanner_type') THEN
          ALTER TABLE vulnerabilities ADD COLUMN scanner_type VARCHAR(50);
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS idx_vulnerabilities_scan_id ON vulnerabilities(scan_id);
      CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
      CREATE INDEX IF NOT EXISTS idx_vulnerabilities_created_at ON vulnerabilities(created_at DESC);

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id),
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pricing (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        features JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (email, password, role)
      VALUES ('admin@security.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [hashedPassword]);
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initDatabase };
