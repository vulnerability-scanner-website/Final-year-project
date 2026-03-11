class UserModel {
  constructor(pg) {
    this.pg = pg;
  }

  async findByEmail(email) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
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
        'SELECT id, email, role, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async create(email, hashedPassword, role = 'user') {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
        [email, hashedPassword, role]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getAll() {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

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
}

module.exports = UserModel;
