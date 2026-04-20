const authenticate = async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
};

const authorizeRoles = (...roles) => async (request, reply) => {
  try {
    await request.jwtVerify();
    if (!roles.includes(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden: insufficient permissions' });
    }
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
};

module.exports = { authenticate, authorizeRoles };
