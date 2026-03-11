class ScanModel {
  constructor(pg) {
    this.pg = pg;
  }

  async create(userId, target, status = 'Running', issues = 0, duration = '-') {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'INSERT INTO scans (user_id, target, status, issues, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, target, status, issues, duration]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findById(id, userId) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM scans WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findByUserId(userId) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM scans WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async updateStatus(id, status, issues = null) {
    const client = await this.pg.connect();
    try {
      const query = issues !== null
        ? 'UPDATE scans SET status = $1, issues = $2 WHERE id = $3 RETURNING *'
        : 'UPDATE scans SET status = $1 WHERE id = $2 RETURNING *';
      
      const params = issues !== null ? [status, issues, id] : [status, id];
      const result = await client.query(query, params);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async delete(id, userId) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'DELETE FROM scans WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

module.exports = ScanModel;
