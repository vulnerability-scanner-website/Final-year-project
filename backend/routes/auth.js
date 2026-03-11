const AuthController = require('../controllers/AuthController');

module.exports = async function (fastify, opts) {
  const authController = new AuthController(fastify);

  fastify.post('/register', async (request, reply) => {
    return authController.register(request, reply);
  });

  fastify.post('/login', async (request, reply) => {
    return authController.login(request, reply);
  });
};
