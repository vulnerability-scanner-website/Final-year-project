const NotificationModel = require('../models/Notification');

class NotificationController {
  constructor(fastify) {
    this.fastify = fastify;
    this.notificationModel = new NotificationModel(fastify.pg);
  }

  // GET /api/notifications
  async getAll(request, reply) {
    try {
      const notifications = await this.notificationModel.findByUserId(request.user.id);
      return notifications;
    } catch (error) {
      console.error('Get notifications error:', error);
      return reply.code(500).send({ error: 'Failed to fetch notifications' });
    }
  }

  // GET /api/notifications/unread-count
  async getUnreadCount(request, reply) {
    try {
      const count = await this.notificationModel.getUnreadCount(request.user.id);
      return { count };
    } catch (error) {
      console.error('Get unread count error:', error);
      return reply.code(500).send({ error: 'Failed to fetch unread count' });
    }
  }

  // PUT /api/notifications/:id/read
  async markRead(request, reply) {
    try {
      const notification = await this.notificationModel.markRead(parseInt(request.params.id), request.user.id);
      if (!notification) return reply.code(404).send({ error: 'Notification not found' });
      return notification;
    } catch (error) {
      console.error('Mark read error:', error);
      return reply.code(500).send({ error: 'Failed to mark notification as read' });
    }
  }

  // PUT /api/notifications/read-all
  async markAllRead(request, reply) {
    try {
      await this.notificationModel.markAllRead(request.user.id);
      return { success: true };
    } catch (error) {
      console.error('Mark all read error:', error);
      return reply.code(500).send({ error: 'Failed to mark all notifications as read' });
    }
  }

  // DELETE /api/notifications/:id
  async delete(request, reply) {
    try {
      const result = await this.notificationModel.delete(parseInt(request.params.id), request.user.id);
      if (!result) return reply.code(404).send({ error: 'Notification not found' });
      return { success: true };
    } catch (error) {
      console.error('Delete notification error:', error);
      return reply.code(500).send({ error: 'Failed to delete notification' });
    }
  }

  // DELETE /api/notifications
  async deleteAll(request, reply) {
    try {
      await this.notificationModel.deleteAll(request.user.id);
      return { success: true };
    } catch (error) {
      console.error('Delete all notifications error:', error);
      return reply.code(500).send({ error: 'Failed to delete notifications' });
    }
  }

  // POST /api/notifications/broadcast  (admin only)
  async broadcast(request, reply) {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Access denied. Admin only.' });
    }
    const { message, type, title } = request.body;
    if (!message) return reply.code(400).send({ error: 'Message is required' });

    try {
      const client = await this.fastify.pg.connect();
      try {
        const users = await client.query('SELECT id FROM users');
        for (const user of users.rows) {
          await this.notificationModel.create(user.id, message, type || 'info', title || 'Admin Broadcast');
        }
      } finally {
        client.release();
      }
      return { success: true, message: 'Broadcast sent to all users' };
    } catch (error) {
      console.error('Broadcast error:', error);
      return reply.code(500).send({ error: 'Failed to broadcast notification' });
    }
  }
}

module.exports = NotificationController;
