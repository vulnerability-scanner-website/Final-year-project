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
      const chapaResponse = await axios.get(
        `${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`,
        { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` } }
      );

      const chapaData = chapaResponse.data.data;
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
                '💳 New Subscription Payment',
                `User ${sub.email} subscribed to ${sub.plan_name} plan. Payment auto-verified.`,
                'success'
              ]
            );
          }
        }
      } else {
        await client.query(
          `UPDATE subscriptions SET payment_status = 'failed' WHERE chapa_tx_ref = $1`,
          [tx_ref]
        );
      }

      return { success: isSuccess, status: chapaData.status, auto_activated: isSuccess };
    } catch (err) {
      console.error('Chapa verify error:', err.response?.data || err.message);
      return reply.code(500).send({ error: 'Payment verification failed' });
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

  // Get current user subscription
  fastify.get('/payments/subscription', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
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
