const bcrypt = require('bcrypt');

module.exports = async function (fastify, opts) {
  const TeamMemberModel = require('../models/TeamMember');
  const teamMemberModel = new TeamMemberModel(fastify.pg);

  await teamMemberModel.ensureTable();

  // Get team members
  fastify.get('/team/members', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const subResult = await client.query(
        `SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active' AND plan_name = 'Enterprise' ORDER BY created_at DESC LIMIT 1`,
        [request.user.id]
      );

      if (subResult.rows.length === 0) {
        return reply.code(403).send({ error: 'No active Enterprise subscription found' });
      }

      const subscription = subResult.rows[0];
      const members = await teamMemberModel.getBySubscription(subscription.id);
      const count = await teamMemberModel.countBySubscription(subscription.id);

      return { members, count, limit: 5, subscription_id: subscription.id };
    } finally {
      client.release();
    }
  });

  // Invite team members
  fastify.post('/team/invite', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { members } = request.body;

    if (!Array.isArray(members) || members.length === 0) {
      return reply.code(400).send({ error: 'members array is required' });
    }

    const client = await fastify.pg.connect();
    try {
      const subResult = await client.query(
        `SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active' AND plan_name = 'Enterprise' ORDER BY created_at DESC LIMIT 1`,
        [request.user.id]
      );

      if (subResult.rows.length === 0) {
        return reply.code(403).send({ error: 'No active Enterprise subscription found' });
      }

      const subscription = subResult.rows[0];
      const currentCount = await teamMemberModel.countBySubscription(subscription.id);

      if (currentCount + members.length > 5) {
        return reply.code(400).send({ 
          error: `Cannot add ${members.length} members. Current: ${currentCount}/5. Available: ${5 - currentCount}` 
        });
      }

      const results = [];
      const errors = [];

      for (const member of members) {
        const { email, password } = member;

        if (!email || !password) {
          errors.push({ email, error: 'Email and password required' });
          continue;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push({ email, error: 'Invalid email format' });
          continue;
        }

        if (password.length < 8) {
          errors.push({ email, error: 'Password must be at least 8 characters' });
          continue;
        }

        // Check if email exists in users table
        const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
          errors.push({ email, error: 'Email already registered' });
          continue;
        }

        // Check if email exists in team_members
        const teamCheck = await client.query(
          'SELECT id FROM team_members WHERE email = $1 AND subscription_id = $2',
          [email, subscription.id]
        );
        if (teamCheck.rows.length > 0) {
          errors.push({ email, error: 'Already in team' });
          continue;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newMember = await teamMemberModel.create(
          subscription.id,
          request.user.id,
          email,
          hashedPassword
        );

        results.push({
          id: newMember.id,
          email: newMember.email,
          status: newMember.status,
          created_at: newMember.created_at,
          password: password // Include password in response so owner can share it
        });
      }

      return {
        success: true,
        invited: results,
        errors: errors.length > 0 ? errors : undefined,
        total_members: currentCount + results.length,
        limit: 5,
        message: `Successfully invited ${results.length} team member(s). Share the credentials with them manually.`
      };
    } finally {
      client.release();
    }
  });

  // Remove team member
  fastify.delete('/team/members/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const deleted = await teamMemberModel.delete(request.params.id, request.user.id);
    if (!deleted) {
      return reply.code(404).send({ error: 'Team member not found' });
    }
    return { success: true };
  });

  // Team member login
  fastify.post('/team/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password required' });
    }

    const teamMember = await teamMemberModel.findByEmail(email);

    if (!teamMember) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    if (teamMember.status !== 'active') {
      return reply.code(403).send({ error: 'Account inactive' });
    }

    if (teamMember.subscription_status !== 'active') {
      return reply.code(403).send({ error: 'Subscription inactive' });
    }

    const isValid = await bcrypt.compare(password, teamMember.password);
    if (!isValid) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    await teamMemberModel.updateLastLogin(teamMember.id);

    const token = fastify.jwt.sign({
      id: teamMember.id,
      email: teamMember.email,
      role: 'team_member',
      subscription_id: teamMember.subscription_id,
      owner_id: teamMember.owner_id
    });

    return {
      success: true,
      token,
      user: {
        id: teamMember.id,
        email: teamMember.email,
        role: 'team_member',
        plan_name: teamMember.plan_name
      }
    };
  });
};
