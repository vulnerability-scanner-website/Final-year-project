const axios = require('axios');

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-WkIFYnNAoscOkZGTknnxP7hhPA4J2nTX';
const CHAPA_BASE_URL = 'https://api.chapa.co/v1';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

module.exports = async function (fastify, opts) {

  // Initiate Chapa payment for a subscription plan
  fastify.post('/payments/initiate', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { plan_id } = request.body;

    if (!plan_id) {
      return reply.code(400).send({ error: 'plan_id is required' });
    }

    const client = await fastify.pg.connect();
    try {
      // Get plan details
      const planResult = await client.query('SELECT * FROM pricing WHERE id = $1', [plan_id]);
      if (planResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Plan not found' });
      }
      const plan = planResult.rows[0];

      // Get user details
      const userResult = await client.query('SELECT * FROM users WHERE id = $1', [request.user.id]);
      const user = userResult.rows[0];

      // Generate unique tx_ref
      const tx_ref = `SUB-${request.user.id}-${plan_id}-${Date.now()}`;

      // Calculate end date (1 month from now)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      // Create pending subscription record
      const subResult = await client.query(
        `INSERT INTO subscriptions (user_id, plan_id, plan_name, amount, status, payment_status, chapa_tx_ref, end_date)
         VALUES ($1, $2, $3, $4, 'pending', 'pending', $5, $6) RETURNING *`,
        [request.user.id, plan_id, plan.name, plan.price, tx_ref, endDate]
      );

      // Initiate Chapa payment
      const chapaResponse = await axios.post(
        `${CHAPA_BASE_URL}/transaction/initialize`,
        {
          amount: plan.price,
          currency: 'ETB',
          email: user.email,
          first_name: user.email.split('@')[0],
          last_name: 'User',
          tx_ref,
          callback_url: `${FRONTEND_URL}/dashboard/payment/callback`,
          return_url: `${FRONTEND_URL}/dashboard/payment/success?tx_ref=${tx_ref}`,
          customization: {
            title: plan.name.substring(0, 16),
            description: `${plan.name} plan`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const checkoutUrl = chapaResponse.data.data.checkout_url;

      // Save checkout URL
      await client.query(
        'UPDATE subscriptions SET chapa_checkout_url = $1 WHERE id = $2',
        [checkoutUrl, subResult.rows[0].id]
      );

      return { checkout_url: checkoutUrl, tx_ref };
    } catch (err) {
      console.error('Chapa initiate error:', err.response?.data || err.message);
      return reply.code(500).send({ error: 'Payment initiation failed' });
    } finally {
      client.release();
    }
  });

  // Verify Chapa payment (called after redirect) — AUTO ACTIVATES
  fastify.get('/payments/verify/:tx_ref', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { tx_ref } = request.params;

    const client = await fastify.pg.connect();
    try {
      // First check if subscription exists
      const subCheckResult = await client.query(
        `SELECT * FROM subscriptions WHERE chapa_tx_ref = $1`,
        [tx_ref]
      );

      if (subCheckResult.rows.length === 0) {
        console.error('Subscription not found for tx_ref:', tx_ref);
        return { success: false, error: 'Subscription record not found', status: 'not_found' };
      }

      // Verify with Chapa
      let chapaResponse;
      try {
        chapaResponse = await axios.get(
          `${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`,
          { 
            headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` },
            timeout: 10000
          }
        );
      } catch (chapaErr) {
        console.error('Chapa API error:', chapaErr.response?.data || chapaErr.message);
        // If Chapa API fails, check if subscription is already paid in DB
        const paidSub = subCheckResult.rows[0];
        if (paidSub.payment_status === 'paid' || paidSub.status === 'active') {
          return { success: true, status: 'already_paid', auto_activated: true };
        }
        // Return error response instead of 500
        return { success: false, error: 'Could not verify payment with gateway', status: 'verification_failed' };
      }

      const chapaData = chapaResponse.data?.data;
      if (!chapaData) {
        console.error('Invalid Chapa response format');
        return { success: false, error: 'Invalid payment gateway response', status: 'invalid_response' };
      }

      const isSuccess = chapaData.status === 'success';

      if (isSuccess) {
        // Auto-activate subscription
        await client.query(
          `UPDATE subscriptions
           SET payment_status = 'paid', status = 'active'
           WHERE chapa_tx_ref = $1`,
          [tx_ref]
        );

        // Get subscription + user info
        const subResult = await client.query(
          `SELECT s.*, u.id as uid, u.email FROM subscriptions s
           JOIN users u ON s.user_id = u.id
           WHERE s.chapa_tx_ref = $1`,
          [tx_ref]
        );

        if (subResult.rows.length > 0) {
          const sub = subResult.rows[0];

          // Activate user account if pending
          await client.query(
            `UPDATE users SET status = 'active' WHERE id = $1 AND status = 'pending'`,
            [sub.uid]
          );

          // Notify user
          await client.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES ($1, $2, $3, $4)`,
            [
              sub.uid,
              '✅ Subscription Activated',
              `Your ${sub.plan_name} plan has been activated automatically. Enjoy all features!`,
              'success'
            ]
          );

          // Notify admins
          const admins = await client.query(`SELECT id FROM users WHERE role = 'admin'`);
          for (const admin of admins.rows) {
            await client.query(
              `INSERT INTO notifications (user_id, title, message, type)
               VALUES ($1, $2, $3, $4)`,
              [
                admin.id,
                'New Subscription Payment',
                `User ${sub.email} subscribed to ${sub.plan_name} plan. Payment auto-verified.`,
                'success'
              ]
            );
          }
        }
      } else {
        // Payment not successful - update subscription status
        await client.query(
          `UPDATE subscriptions SET payment_status = 'failed' WHERE chapa_tx_ref = $1`,
          [tx_ref]
        );
        console.log('Payment failed. Chapa status:', chapaData.status);
      }

      return { success: isSuccess, status: chapaData.status, auto_activated: isSuccess };
    } catch (err) {
      console.error('Chapa verify error:', err.message);
      // Return proper error response instead of 500
      return { success: false, error: 'Payment verification failed', status: 'error' };
    } finally {
      client.release();
    }
  });

  // Also support POST method for payment verification
  fastify.post('/payments/verify/:tx_ref', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { tx_ref } = request.params;

    const client = await fastify.pg.connect();
    try {
      // First check if subscription exists
      const subCheckResult = await client.query(
        `SELECT * FROM subscriptions WHERE chapa_tx_ref = $1`,
        [tx_ref]
      );

      if (subCheckResult.rows.length === 0) {
        console.error('Subscription not found for tx_ref:', tx_ref);
        return { success: false, error: 'Subscription record not found', status: 'not_found' };
      }

      // Verify with Chapa
      let chapaResponse;
      try {
        chapaResponse = await axios.get(
          `${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`,
          { 
            headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` },
            timeout: 10000
          }
        );
      } catch (chapaErr) {
        console.error('Chapa API error:', chapaErr.response?.data || chapaErr.message);
        const paidSub = subCheckResult.rows[0];
        if (paidSub.payment_status === 'paid' || paidSub.status === 'active') {
          return { success: true, status: 'already_paid', auto_activated: true };
        }
        return { success: false, error: 'Could not verify payment with gateway', status: 'verification_failed' };
      }

      const chapaData = chapaResponse.data?.data;
      if (!chapaData) {
        console.error('Invalid Chapa response format');
        return { success: false, error: 'Invalid payment gateway response', status: 'invalid_response' };
      }

      const isSuccess = chapaData.status === 'success';

      if (isSuccess) {
        await client.query(
          `UPDATE subscriptions SET payment_status = 'paid', status = 'active' WHERE chapa_tx_ref = $1`,
          [tx_ref]
        );

        const subResult = await client.query(
          `SELECT s.*, u.id as uid, u.email FROM subscriptions s JOIN users u ON s.user_id = u.id WHERE s.chapa_tx_ref = $1`,
          [tx_ref]
        );

        if (subResult.rows.length > 0) {
          const sub = subResult.rows[0];
          await client.query(`UPDATE users SET status = 'active' WHERE id = $1 AND status = 'pending'`, [sub.uid]);
          await client.query(
            `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
            [sub.uid, '✅ Subscription Activated', `Your ${sub.plan_name} plan has been activated!`, 'success']
          );
        }
      } else {
        await client.query(`UPDATE subscriptions SET payment_status = 'failed' WHERE chapa_tx_ref = $1`, [tx_ref]);
      }

      return { success: isSuccess, status: chapaData.status, auto_activated: isSuccess };
    } catch (err) {
      console.error('Payment verify POST error:', err.message);
      return { success: false, error: 'Payment verification failed', status: 'error' };
    } finally {
      client.release();
    }
  });

  // Chapa Webhook — server-side auto-verification (no auth required)
  fastify.post('/payments/webhook', async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const { tx_ref, status } = request.body || {};
      if (!tx_ref || status !== 'success') return { received: true };

      // Verify with Chapa
      const chapaResponse = await axios.get(
        `${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`,
        { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` } }
      );

      if (chapaResponse.data.data.status !== 'success') return { received: true };

      // Auto-activate
      await client.query(
        `UPDATE subscriptions SET payment_status = 'paid', status = 'active' WHERE chapa_tx_ref = $1`,
        [tx_ref]
      );

      const subResult = await client.query(
        `SELECT s.*, u.id as uid, u.email FROM subscriptions s
         JOIN users u ON s.user_id = u.id WHERE s.chapa_tx_ref = $1`,
        [tx_ref]
      );

      if (subResult.rows.length > 0) {
        const sub = subResult.rows[0];
        await client.query(`UPDATE users SET status = 'active' WHERE id = $1 AND status = 'pending'`, [sub.uid]);
        await client.query(
          `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [sub.uid, '✅ Subscription Activated', `Your ${sub.plan_name} plan is now active!`, 'success']
        );
      }

      return { received: true };
    } catch (err) {
      console.error('Webhook error:', err.message);
      return { received: true };
    } finally {
      client.release();
    }
  });

  // Get all transactions (admin only)
  fastify.get('/payments/transactions', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Admin access required' });
    }

    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        `SELECT s.id, s.user_id, s.plan_id, s.plan_name, s.amount, s.payment_status, s.chapa_tx_ref, s.created_at, u.email as user_email
         FROM subscriptions s
         JOIN users u ON s.user_id = u.id
         ORDER BY s.created_at DESC`
      );

      const transactions = result.rows;

      // Calculate summary
      const summary = {
        totalRevenue: transactions.reduce((sum, t) => sum + (t.payment_status === 'paid' ? parseFloat(t.amount) : 0), 0),
        totalTransactions: transactions.length,
        successfulPayments: transactions.filter(t => t.payment_status === 'paid').length,
        pendingPayments: transactions.filter(t => t.payment_status === 'pending').length,
        failedPayments: transactions.filter(t => t.payment_status === 'failed').length,
      };

      return { transactions, summary };
    } finally {
      client.release();
    }
  });

  // Get current user subscription
  fastify.get('/payments/subscription', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      // Check if user is a team member
      if (request.user.role === 'team_member') {
        const result = await client.query(
          `SELECT s.*, p.features FROM team_members tm
           JOIN subscriptions s ON tm.subscription_id = s.id
           LEFT JOIN pricing p ON s.plan_id = p.id
           WHERE tm.id = $1`,
          [request.user.id]
        );
        if (result.rows.length > 0) return result.rows[0];
        return reply.code(404).send({ error: 'Team member subscription not found' });
      }

      const result = await client.query(
        `SELECT s.*, p.features FROM subscriptions s
         LEFT JOIN pricing p ON s.plan_id = p.id
         WHERE s.user_id = $1 ORDER BY s.created_at DESC LIMIT 1`,
        [request.user.id]
      );

      if (result.rows.length > 0) return result.rows[0];

      // No subscription — return free plan usage
      const userRes = await client.query(
        'SELECT free_scans_used, free_plan_start FROM users WHERE id = $1',
        [request.user.id]
      );
      const user = userRes.rows[0];
      const planStart = user?.free_plan_start ? new Date(user.free_plan_start) : new Date();
      const monthsElapsed = (Date.now() - planStart.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const expired = monthsElapsed >= 3;

      return {
        status: expired ? 'expired' : 'free',
        plan_name: 'Free',
        free_scans_used: user?.free_scans_used || 0,
        free_scans_limit: 3,
        free_months_limit: 3,
        free_plan_start: planStart,
        expired
      };
    } finally {
      client.release();
    }
  });
};
