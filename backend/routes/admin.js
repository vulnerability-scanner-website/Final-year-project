const AdminController = require('../controllers/AdminController');

module.exports = async function (fastify, opts) {
  const adminController = new AdminController(fastify);

  // All routes require authentication
  const authOptions = { onRequest: [fastify.authenticate] };

  // Get user statistics (admin only) - must be before :id route
  fastify.get('/admin/users/stats', authOptions, async (request, reply) => {
    return adminController.getUserStats(request, reply);
  });

  // Get all users (admin only)
  fastify.get('/admin/users', authOptions, async (request, reply) => {
    return adminController.getAllUsers(request, reply);
  });

  // Toggle user status (admin only) - must be before :id route
  fastify.patch('/admin/users/:id/status', authOptions, async (request, reply) => {
    return adminController.toggleUserStatus(request, reply);
  });

  // Get user by ID (admin only)
  fastify.get('/admin/users/:id', authOptions, async (request, reply) => {
    return adminController.getUserById(request, reply);
  });

  // Create new user (admin only)
  fastify.post('/admin/users', authOptions, async (request, reply) => {
    return adminController.createUser(request, reply);
  });

  // Update user (admin only)
  fastify.put('/admin/users/:id', authOptions, async (request, reply) => {
    return adminController.updateUser(request, reply);
  });

  // Delete user (admin only)
  fastify.delete('/admin/users/:id', authOptions, async (request, reply) => {
    return adminController.deleteUser(request, reply);
  });
};
