module.exports = async function (fastify, opts) {
  
  // Get all payment transactions (Admin only)
  fastify.get('/payments/transactions', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    // Check if user is admin
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied. Admin only.' });
    }

    const client = await fastify.pg.connect();
    try {
      // Fetch all subscriptions with user details
      const transactionsResult = await client.query(`
        SELECT 
          s.id,
          s.user_id,
          s.plan_id,
          s.plan_name,
          s.amount,
          s.status,
          s.payment_status,
          s.chapa_tx_ref,
          s.chapa_checkout_url,
          s.created_at,
          s.end_date,
          u.email as user_email,
          u.role as user_role
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.created_at DESC
      `);

      const transactions = transactionsResult.rows;

      // Calculate summary statistics
      const summary = {
        totalRevenue: 0,
        totalTransactions: transactions.length,
        successfulPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
      };

      transactions.forEach(t => {
        if (t.payment_status === 'paid') {
          summary.totalRevenue += parseFloat(t.amount || 0);
          summary.successfulPayments++;
        } else if (t.payment_status === 'pending') {
          summary.pendingPayments++;
        } else if (t.payment_status === 'failed') {
          summary.failedPayments++;
        }
      });

      return {
        transactions,
        summary,
      };
    } catch (err) {
      console.error('Error fetching transactions:', err.message);
      return reply.code(500).send({ error: 'Failed to fetch transactions' });
    } finally {
      client.release();
    }
  });

  // Get transaction statistics by date range (Admin only)
  fastify.get('/payments/statistics', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied. Admin only.' });
    }

    const { start_date, end_date } = request.query;

    const client = await fastify.pg.connect();
    try {
      let query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as transaction_count,
          SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as daily_revenue,
          COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as successful_count,
          COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_count
        FROM subscriptions
      `;

      const params = [];
      if (start_date && end_date) {
        query += ` WHERE created_at BETWEEN $1 AND $2`;
        params.push(start_date, end_date);
      }

      query += ` GROUP BY DATE(created_at) ORDER BY date DESC`;

      const result = await client.query(query, params);

      return {
        statistics: result.rows,
      };
    } catch (err) {
      console.error('Error fetching statistics:', err.message);
      return reply.code(500).send({ error: 'Failed to fetch statistics' });
    } finally {
      client.release();
    }
  });

  // Get single transaction details (Admin only)
  fastify.get('/payments/transactions/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied. Admin only.' });
    }

    const { id } = request.params;

    const client = await fastify.pg.connect();
    try {
      const result = await client.query(`
        SELECT 
          s.*,
          u.email as user_email,
          u.role as user_role,
          u.created_at as user_joined_date,
          p.features as plan_features
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN pricing p ON s.plan_id = p.id
        WHERE s.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Transaction not found' });
      }

      return result.rows[0];
    } catch (err) {
      console.error('Error fetching transaction:', err.message);
      return reply.code(500).send({ error: 'Failed to fetch transaction' });
    } finally {
      client.release();
    }
  });
};
