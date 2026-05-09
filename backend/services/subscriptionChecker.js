class SubscriptionChecker {
  constructor(pg) {
    this.pg = pg;
  }

  async getUserSubscription(userId, userRole = null) {
    const client = await this.pg.connect();
    try {
      // If user is a team member, get subscription through team_members table
      if (userRole === 'team_member') {
        const teamSubResult = await client.query(`
          SELECT s.*, p.name as plan_name, p.scan_limit, p.access_days, p.scanners
          FROM team_members tm
          JOIN subscriptions s ON tm.subscription_id = s.id
          JOIN pricing p ON s.plan_id = p.id
          WHERE tm.id = $1 AND tm.status = 'active'
        `, [userId]);

        if (teamSubResult.rows.length > 0) {
          return teamSubResult.rows[0];
        }
      }

      // Check for active subscription
      const subResult = await client.query(`
        SELECT s.*, p.name as plan_name, p.scan_limit, p.access_days, p.scanners
        FROM subscriptions s
        JOIN pricing p ON s.plan_id = p.id
        WHERE s.user_id = $1 AND s.status = 'active' AND s.end_date > NOW()
        ORDER BY s.created_at DESC
        LIMIT 1
      `, [userId]);

      if (subResult.rows.length > 0) {
        return subResult.rows[0];
      }

      // No active subscription, return Free plan
      const freePlanResult = await client.query(`
        SELECT id, name as plan_name, scan_limit, access_days, scanners
        FROM pricing
        WHERE name = 'Free'
        LIMIT 1
      `);

      return freePlanResult.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async checkScanLimit(userId, subscription) {
    if (!subscription) return { allowed: false, message: 'No subscription found' };

    // Unlimited scans for Enterprise
    if (subscription.scan_limit === -1) {
      return { allowed: true, remaining: -1 };
    }

    const client = await this.pg.connect();
    try {
      // Count scans this month
      const scanCount = await client.query(`
        SELECT COUNT(*) as count
        FROM scans
        WHERE user_id = $1 AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `, [userId]);

      const used = parseInt(scanCount.rows[0].count);
      const remaining = subscription.scan_limit - used;

      if (remaining <= 0) {
        return {
          allowed: false,
          message: `You have reached your monthly scan limit of ${subscription.scan_limit}`,
          used,
          limit: subscription.scan_limit
        };
      }

      return { allowed: true, remaining, used, limit: subscription.scan_limit };
    } finally {
      client.release();
    }
  }

  async checkAccessExpiry(userId, subscription) {
    if (!subscription) return { valid: false, message: 'No subscription found' };

    // Unlimited access for Enterprise
    if (subscription.access_days === -1) {
      return { valid: true, unlimited: true };
    }

    const client = await this.pg.connect();
    try {
      // For Free plan, check free_plan_start
      if (subscription.plan_name === 'Free') {
        const userResult = await client.query(`
          SELECT free_plan_start FROM users WHERE id = $1
        `, [userId]);

        const planStart = userResult.rows[0]?.free_plan_start;
        if (!planStart) {
          // Initialize free plan start
          await client.query(`
            UPDATE users SET free_plan_start = NOW() WHERE id = $1
          `, [userId]);
          return { valid: true, daysRemaining: subscription.access_days };
        }

        const daysSinceStart = Math.floor((Date.now() - new Date(planStart).getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = subscription.access_days - daysSinceStart;

        if (daysRemaining <= 0) {
          return {
            valid: false,
            message: `Your ${subscription.access_days}-day free access has expired. Please upgrade to continue.`
          };
        }

        return { valid: true, daysRemaining };
      }

      // For paid plans, check subscription end_date
      if (subscription.end_date) {
        const daysRemaining = Math.floor((new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 0) {
          return {
            valid: false,
            message: 'Your subscription has expired. Please renew to continue.'
          };
        }

        return { valid: true, daysRemaining };
      }

      return { valid: true };
    } finally {
      client.release();
    }
  }

  getScanners(subscription) {
    if (!subscription || !subscription.scanners) {
      return ['custom', 'subfinder']; // Default Free plan scanners
    }
    return subscription.scanners;
  }

  hasAIAccess(subscription) {
    if (!subscription || !subscription.scanners) return false;
    return subscription.scanners.includes('ai');
  }
}

module.exports = SubscriptionChecker;
