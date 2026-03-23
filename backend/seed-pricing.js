const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  INSERT INTO pricing (name, price, features)
  VALUES 
    ('Basic', 500, '["10 scans/month","Basic vulnerability detection","Email support","30 days history"]'),
    ('Professional', 1500, '["50 scans/month","Advanced threat detection","Priority support","90 days history"]'),
    ('Enterprise', 4000, '["Unlimited scans","AI-powered detection","24/7 support","Unlimited history"]')
  ON CONFLICT DO NOTHING
`).then(() => {
  console.log('Pricing plans seeded');
  pool.end();
}).catch(e => {
  console.error(e.message);
  pool.end();
});
