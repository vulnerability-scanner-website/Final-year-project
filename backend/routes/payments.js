const axios = require('axios');

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-your-chapa-secret-key';
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

  // Verify Chapa payment (called after redirect)
  fastify.get('/payments/verify/:tx_ref', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { tx_ref } = request.params;

    const client = await fastify.pg.connect();
    try {
      const chapaResponse = await axios.get(
        `${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`,
        {
          headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` },
        }
      );

      const chapaData = chapaResponse.data.data;
      const isSuccess = chapaData.status === 'success';

      // Keep status as 'pending' - admin must confirm to activate
      await client.query(
        `UPDATE subscriptions 
         SET payment_status = $1
         WHERE chapa_tx_ref = $2`,
        [isSuccess ? 'paid' : 'failed', tx_ref]
      );

      return { success: isSuccess, status: chapaData.status };
    } catch (err) {
      console.error('Chapa verify error:', err.response?.data || err.message);
      return reply.code(500).send({ error: 'Payment verification failed' });
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
      return result.rows[0] || { status: 'none' };
    } finally {
      client.release();
    }
  });
};
