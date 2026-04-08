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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMP,
        vulnerabilities_data JSONB
      );

      -- Add missing columns if they don't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scans' AND column_name='finished_at') THEN
          ALTER TABLE scans ADD COLUMN finished_at TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scans' AND column_name='vulnerabilities_data') THEN
          ALTER TABLE scans ADD COLUMN vulnerabilities_data JSONB;
        END IF;
      END $$;

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
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vulnerabilities' AND column_name='ai_type') THEN
          ALTER TABLE vulnerabilities ADD COLUMN ai_type VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vulnerabilities' AND column_name='ai_confidence') THEN
          ALTER TABLE vulnerabilities ADD COLUMN ai_confidence DECIMAL(3,2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vulnerabilities' AND column_name='ai_results') THEN
          ALTER TABLE vulnerabilities ADD COLUMN ai_results JSONB;
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS idx_vulnerabilities_scan_id ON vulnerabilities(scan_id);
      CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
      CREATE INDEX IF NOT EXISTS idx_vulnerabilities_created_at ON vulnerabilities(created_at DESC);

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) DEFAULT 'Notification',
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='type') THEN
          ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT 'info';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='title') THEN
          ALTER TABLE notifications ADD COLUMN title VARCHAR(255) DEFAULT 'Notification';
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id),
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pricing (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        features JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Migration: add unique constraint if missing
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'pricing_name_key'
        ) THEN
          -- Remove duplicates first, keep lowest id
          DELETE FROM pricing WHERE id NOT IN (
            SELECT MIN(id) FROM pricing GROUP BY name
          );
          ALTER TABLE pricing ADD CONSTRAINT pricing_name_key UNIQUE (name);
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES pricing(id),
        plan_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        chapa_tx_ref VARCHAR(255) UNIQUE,
        chapa_checkout_url TEXT,
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
    `);

    // Seed plans — only insert if name doesn't exist
    await client.query(`
      INSERT INTO pricing (name, price, features) VALUES
        ('Free', 0, '["3 scans/month","Basic vulnerability detection","3 months access","Community support"]'),
        ('Basic', 500, '["10 scans/month","Basic vulnerability detection","Email support","30 days history"]'),
        ('Professional', 1500, '["50 scans/month","Advanced threat detection","Priority support","90 days history"]'),
        ('Enterprise', 4000, '["Unlimited scans","AI-powered detection","24/7 support","Unlimited history"]')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Migration: add free plan tracking columns to users
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='free_scans_used') THEN
          ALTER TABLE users ADD COLUMN free_scans_used INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='free_plan_start') THEN
          ALTER TABLE users ADD COLUMN free_plan_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (email, password, role)
      VALUES ('admin@security.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [hashedPassword]);
    
    // Insert default pricing plans
    await client.query(`
      INSERT INTO pricing (name, price, features)
      VALUES 
        ('Basic', 0, '{"scans": 10, "support": "email", "history_days": 30, "reports": "pdf"}'),
        ('Professional', 1500, '{"scans": 50, "support": "priority", "history_days": 90, "reports": "detailed_pdf", "api_access": true}'),
        ('Enterprise', 4000, '{"scans": "unlimited", "support": "24/7", "history_days": "unlimited", "reports": "advanced", "api_access": true, "custom_integrations": true}')
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initDatabase };