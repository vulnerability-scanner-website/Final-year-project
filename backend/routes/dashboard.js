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
