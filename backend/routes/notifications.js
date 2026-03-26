const NotificationController = require('../controllers/NotificationController');

module.exports = async function (fastify, opts) {
  const ctrl = new NotificationController(fastify);
  const auth = { onRequest: [fastify.authenticate] };

  fastify.get('/notifications',              auth, (req, rep) => ctrl.getAll(req, rep));
  fastify.get('/notifications/unread-count', auth, (req, rep) => ctrl.getUnreadCount(req, rep));
  fastify.post('/notifications/read-all',     auth, (req, rep) => ctrl.markAllRead(req, rep));
  fastify.delete('/notifications/all',       auth, (req, rep) => ctrl.deleteAll(req, rep));
  fastify.post('/notifications/broadcast',   auth, (req, rep) => ctrl.broadcast(req, rep));

  // Parameterized routes — must come AFTER all static routes
  fastify.delete('/notifications/:id',       auth, (req, rep) => ctrl.delete(req, rep));

  // Use PATCH instead of PUT for mark-read to avoid Fastify tree conflict
  fastify.post('/notifications/:id/read',   auth, (req, rep) => ctrl.markRead(req, rep));
};
