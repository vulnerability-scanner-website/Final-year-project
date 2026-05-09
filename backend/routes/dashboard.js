module.exports = async function (fastify, opts) {
  // Get dashboard stats
  fastify.get('/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const totalScans = await client.query('SELECT COUNT(*) FROM scans WHERE user_id = $1', [request.user.id]);
      const activeScans = await client.query('SELECT COUNT(*) FROM scans WHERE user_id = $1 AND status = $2', [request.user.id, 'Running']);
      const totalVulnerabilities = await client.query('SELECT COUNT(*) FROM vulnerabilities v JOIN scans s ON v.scan_id = s.id WHERE s.user_id = $1', [request.user.id]);
      return {
        totalScans: parseInt(totalScans.rows[0].count),
        activeScans: parseInt(activeScans.rows[0].count),
        totalVulnerabilities: parseInt(totalVulnerabilities.rows[0].count)
      };
    } finally {
      client.release();
    }
  });

  // Get admin dashboard stats
  fastify.get('/admin/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Admin access required' });
    }

    const client = await fastify.pg.connect();
    try {
      // Total scans
      const totalScans = await client.query('SELECT COUNT(*) FROM scans');
      
      // Critical issues
      const criticalIssues = await client.query(
        "SELECT COUNT(*) FROM vulnerabilities WHERE severity = 'critical'"
      );
      
      // High severity
      const highSeverity = await client.query(
        "SELECT COUNT(*) FROM vulnerabilities WHERE severity = 'high'"
      );
      
      // Resolved issues (assuming status = 'Resolved')
      const resolved = await client.query(
        "SELECT COUNT(*) FROM vulnerabilities WHERE status = 'Resolved'"
      );

      // Total users
      const totalUsers = await client.query('SELECT COUNT(*) FROM users');

      // New users this month
      const newUsers = await client.query(
        "SELECT COUNT(*) FROM users WHERE created_at >= date_trunc('month', CURRENT_DATE)"
      );

      // Scans last month for comparison
      const lastMonthScans = await client.query(
        "SELECT COUNT(*) FROM scans WHERE created_at >= date_trunc('month', CURRENT_DATE - interval '1 month') AND created_at < date_trunc('month', CURRENT_DATE)"
      );

      const currentMonthScans = await client.query(
        "SELECT COUNT(*) FROM scans WHERE created_at >= date_trunc('month', CURRENT_DATE)"
      );

      const lastMonth = parseInt(lastMonthScans.rows[0].count) || 1;
      const currentMonth = parseInt(currentMonthScans.rows[0].count);
      const scanGrowth = Math.round(((currentMonth - lastMonth) / lastMonth) * 100);

      return {
        totalScans: parseInt(totalScans.rows[0].count),
        criticalIssues: parseInt(criticalIssues.rows[0].count),
        highSeverity: parseInt(highSeverity.rows[0].count),
        resolved: parseInt(resolved.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
        newUsers: parseInt(newUsers.rows[0].count),
        scanGrowth: scanGrowth
      };
    } finally {
      client.release();
    }
  });

  // Get recent scans
  fastify.get('/recent-scans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query('SELECT * FROM scans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [request.user.id]);
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Get vulnerabilities summary
  fastify.get('/vulnerabilities-summary', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT severity, COUNT(*) FROM vulnerabilities v JOIN scans s ON v.scan_id = s.id WHERE s.user_id = $1 GROUP BY severity',
        [request.user.id]
      );
      return result.rows;
    } finally {
      client.release();
    }
  });
};
