const { Client } = require('pg');
require('dotenv').config();

async function migrateDatabase() {
  const client = new Client({
    connectionString: 'postgres://postgres:postgres@localhost:5432/security_scanner',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Add google_id column
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
    `);
    console.log('✓ Added google_id column');

    // Add auth_provider column
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'local';
    `);
    console.log('✓ Added auth_provider column');

    // Make password nullable for Google users
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN password DROP NOT NULL;
    `);
    console.log('✓ Made password column nullable');

    console.log('\n✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  migrateDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = migrateDatabase;
