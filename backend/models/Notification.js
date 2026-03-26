class NotificationModel {
  constructor(pg) {
    this.pg = pg;
  }

  async create(userId, message, type = 'info', title = 'Notification') {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'INSERT INTO notifications (user_id, message, type, title) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, message, type, title]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Notify all admins
  async notifyAdmins(message, type = 'info', title = 'System Notification') {
    const client = await this.pg.connect();
    try {
      const admins = await client.query("SELECT id FROM users WHERE role = 'admin'");
      for (const admin of admins.rows) {
        await client.query(
          'INSERT INTO notifications (user_id, message, type, title) VALUES ($1, $2, $3, $4)',
          [admin.id, message, type, title]
        );
      }
    } finally {
      client.release();
    }
  }

  async findByUserId(userId) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getUnreadCount(userId) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
        [userId]
      );
      return parseInt(result.rows[0].count);
    } finally {
      client.release();
    }
  }

  async markRead(id, userId) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async markAllRead(userId) {
    const client = await this.pg.connect();
    try {
      await client.query('UPDATE notifications SET read = true WHERE user_id = $1', [userId]);
    } finally {
      client.release();
    }
  }

  async delete(id, userId) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteAll(userId) {
    const client = await this.pg.connect();
    try {
      await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    } finally {
      client.release();
    }
  }
}

module.exports = NotificationModel;
