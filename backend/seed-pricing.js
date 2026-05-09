require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  INSERT INTO pricing (name, price, features, scan_limit, access_days, scanners)
  VALUES 
    ('Free', 0, '["3 scans per month","Basic security analysis","Community support","90 days access"]', 3, 90, ARRAY['custom', 'subfinder']),
    ('Basic', 500, '["10 scans per month","Enhanced security scanning","Email support","150 days access"]', 10, 150, ARRAY['custom', 'subfinder', 'nikto']),
    ('Professional', 1500, '["50 scans per month","Advanced threat detection","Priority support","90 days access"]', 50, 90, ARRAY['custom', 'subfinder', 'nikto', 'zap']),
    ('Enterprise', 4000, '["Unlimited scans","AI-powered threat intelligence","24/7 dedicated support","Unlimited access"]', -1, -1, ARRAY['custom', 'subfinder', 'nikto', 'zap', 'ai'])
  ON CONFLICT (name) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    scan_limit = EXCLUDED.scan_limit,
    access_days = EXCLUDED.access_days,
    scanners = EXCLUDED.scanners
`).then(() => {
  console.log('Pricing plans seeded');
  pool.end();
}).catch(e => {
  console.error(e.message);
  pool.end();
});
