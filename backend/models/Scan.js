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
      // Get scan
      const scanResult = await client.query(
        'SELECT * FROM scans WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (scanResult.rows.length === 0) {
        return null;
      }
      
      const scan = scanResult.rows[0];
      
      // Get vulnerabilities for this scan
      const vulnResult = await client.query(
        `SELECT id, title, severity, description, affected_url as url, affected_parameter as param, 
                evidence, remediation as solution, cwe_id as cwe, cvss_score, scanner_type as source,
                ai_type, ai_confidence
         FROM vulnerabilities 
         WHERE scan_id = $1 
         ORDER BY 
           CASE severity 
             WHEN 'critical' THEN 1 
             WHEN 'high' THEN 2 
             WHEN 'medium' THEN 3 
             WHEN 'low' THEN 4 
             ELSE 5 
           END, 
           created_at DESC`,
        [id]
      );
      
      scan.vulnerabilities = vulnResult.rows;
      return scan;
    } finally {
      client.release();
    }
  }

  async findByUserId(userId) {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'SELECT id, user_id, target, status, issues, duration, created_at FROM scans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
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
