// backend/models/TeamMember.js

class TeamMemberModel {
  constructor(pg) {
    this.pg = pg;
  }

  async ensureTable() {
    const client = await this.pg.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS team_members (
          id SERIAL PRIMARY KEY,
          subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
          owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP,
          UNIQUE(subscription_id, email)
        );
      `);
      console.log('✅ team_members table ensured');
    } finally {
      client.release();
    }
  }

  async create(subscriptionId, ownerId, email, hashedPassword) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        `INSERT INTO team_members (subscription_id, owner_id, email, password, status)
         VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
        [subscriptionId, ownerId, email, hashedPassword]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getBySubscription(subscriptionId) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        `SELECT id, email, status, created_at, last_login FROM team_members WHERE subscription_id = $1 ORDER BY created_at DESC`,
        [subscriptionId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async countBySubscription(subscriptionId) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM team_members WHERE subscription_id = $1`,
        [subscriptionId]
      );
      return parseInt(result.rows[0].count);
    } finally {
      client.release();
    }
  }

  async findByEmail(email) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        `SELECT tm.*, s.plan_name, s.status as subscription_status, s.end_date, s.user_id as owner_user_id
         FROM team_members tm
         JOIN subscriptions s ON tm.subscription_id = s.id
         WHERE tm.email = $1`,
        [email]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateLastLogin(id) {
    const client = await this.pg.connect();
    try {
      await client.query(
        `UPDATE team_members SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );
    } finally {
      client.release();
    }
  }

  async delete(id, ownerId) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        `DELETE FROM team_members WHERE id = $1 AND owner_id = $2 RETURNING id`,
        [id, ownerId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

module.exports = TeamMemberModel;
