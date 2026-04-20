const AdminController = require('../controllers/AdminController');

module.exports = async function (fastify, opts) {
  const adminController = new AdminController(fastify);

  // All routes require admin role
  const adminOnly = { onRequest: [fastify.authorizeRoles('admin')] };

  // Get user statistics (admin only) - must be before :id route
  fastify.get('/admin/users/stats', adminOnly, async (request, reply) => {
    return adminController.getUserStats(request, reply);
  });

  fastify.get('/admin/users', adminOnly, async (request, reply) => {
    return adminController.getAllUsers(request, reply);
  });

  fastify.patch('/admin/users/:id/status', adminOnly, async (request, reply) => {
    return adminController.toggleUserStatus(request, reply);
  });

  fastify.get('/admin/users/:id', adminOnly, async (request, reply) => {
    return adminController.getUserById(request, reply);
  });

  fastify.post('/admin/users', adminOnly, async (request, reply) => {
    return adminController.createUser(request, reply);
  });

  fastify.put('/admin/users/:id', adminOnly, async (request, reply) => {
    return adminController.updateUser(request, reply);
  });

  fastify.delete('/admin/users/:id', adminOnly, async (request, reply) => {
    return adminController.deleteUser(request, reply);
  });
};
