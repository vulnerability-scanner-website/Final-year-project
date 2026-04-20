const AuthController = require('../controllers/AuthController');
const { validateInput, schemas } = require('../middlewares/validation');

module.exports = async function (fastify, opts) {
  const authController = new AuthController(fastify);

  fastify.post('/register', { 
    preHandler: validateInput(schemas.register) 
  }, async (request, reply) => {
    return authController.register(request, reply);
  });

  fastify.post('/login', { 
    preHandler: validateInput(schemas.login) 
  }, async (request, reply) => {
    return authController.login(request, reply);
  });

  fastify.post('/forgot-password', {
    preHandler: validateInput(schemas.forgotPassword)
  }, async (request, reply) => {
    return authController.forgotPassword(request, reply);
  });

  fastify.post('/reset-password', {
    preHandler: validateInput(schemas.resetPassword)
  }, async (request, reply) => {
    return authController.resetPassword(request, reply);
  });
};
