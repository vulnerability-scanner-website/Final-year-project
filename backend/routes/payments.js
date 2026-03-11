const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_key_here');

module.exports = async function (fastify, opts) {
  // Create checkout session
  fastify.post('/create-checkout-session', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { priceId, planName } = request.body;
    
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
        customer_email: request.user.email,
        metadata: {
          userId: request.user.id,
          planName: planName
        }
      });
      
      return { url: session.url, sessionId: session.id };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Webhook handler for Stripe events
  fastify.post('/webhook', async (request, reply) => {
    const sig = request.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret'
      );
    } catch (err) {
      return reply.code(400).send({ error: `Webhook Error: ${err.message}` });
    }

    const client = await fastify.pg.connect();
    
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          // Update user subscription in database
          await client.query(
            'UPDATE users SET subscription_status = $1, subscription_id = $2 WHERE id = $3',
            ['active', session.subscription, session.metadata.userId]
          );
          break;

        case 'customer.subscription.updated':
          const subscription = event.data.object;
          await client.query(
            'UPDATE users SET subscription_status = $1 WHERE subscription_id = $2',
            [subscription.status, subscription.id]
          );
          break;

        case 'customer.subscription.deleted':
          const deletedSub = event.data.object;
          await client.query(
            'UPDATE users SET subscription_status = $1 WHERE subscription_id = $2',
            ['canceled', deletedSub.id]
          );
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return { received: true };
    } finally {
      client.release();
    }
  });

  // Get user subscription status
  fastify.get('/subscription', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT subscription_status, subscription_id FROM users WHERE id = $1',
        [request.user.id]
      );
      return result.rows[0] || { subscription_status: 'none' };
    } finally {
      client.release();
    }
  });

  // Cancel subscription
  fastify.post('/cancel-subscription', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const user = await client.query(
        'SELECT subscription_id FROM users WHERE id = $1',
        [request.user.id]
      );
      
      if (!user.rows[0]?.subscription_id) {
        return reply.code(404).send({ error: 'No active subscription found' });
      }

      await stripe.subscriptions.cancel(user.rows[0].subscription_id);
      
      await client.query(
        'UPDATE users SET subscription_status = $1 WHERE id = $2',
        ['canceled', request.user.id]
      );

      return { success: true, message: 'Subscription canceled' };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    } finally {
      client.release();
    }
  });
};
