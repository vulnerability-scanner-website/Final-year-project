// backend/models/UserModel.js

class UserModel {
  constructor(pg) {
    this.pg = pg;
  }

  // ========================
  // Ensure status column exists
  // ========================
  async ensureStatusColumn() {
    const client = await this.pg.connect();
    try {
      const check = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='users' AND column_name='status';
      `);

      if (check.rows.length === 0) {
        console.log("Adding 'status' column to users table...");
        await client.query(`
          ALTER TABLE users
          ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        `);
        console.log("'status' column added successfully!");
      } else {
        console.log("'status' column already exists.");
      }
    } finally {
      client.release();
    }
  }

  // ========================
  // Find user by email
  // ========================
  async findByEmail(email) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'SELECT id, email, password, role, status, created_at FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

 
  async findById(id) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'SELECT id, email, role, status, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // ========================
  // Create new user
  // ========================
  async create(email, hashedPassword, role = 'user') {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'INSERT INTO users (email, password, role, status) VALUES ($1, $2, $3, $4) RETURNING id, email, role, status, created_at',
        [email, hashedPassword, role, 'active']
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // ========================
  // Get all users
  // ========================
  async getAll() {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // ========================
  // Delete user
  // ========================
  async delete(id) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // ========================
  // Toggle / Update user status
  // ========================
  async updateStatus(id, status) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, role, status',
        [status, id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

module.exports = UserModel;