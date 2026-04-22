const AuthController = require('../controllers/AuthController');
const axios = require('axios');
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

  // Google OAuth routes
  fastify.get('/google', async (request, reply) => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('profile email')}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    return reply.redirect(googleAuthUrl);
  });

  fastify.get('/google/callback', async (request, reply) => {
    console.log('=== Google Callback Started ===');
    const { code } = request.query;
    
    if (!code) {
      console.error('No code in callback');
      return reply.redirect(`${process.env.FRONTEND_URL}/auth/login?error=no_code`);
    }

    try {
      console.log('Exchanging code for tokens');
      // Exchange code for tokens
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code'
      });

      const { access_token } = tokenResponse.data;
      console.log('Got access token');

      // Get user info
      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const { email, id: googleId } = userInfoResponse.data;
      console.log('Got user info:', email, googleId);

      request.user = { email, googleId };
      return authController.googleCallback(request, reply);
    } catch (error) {
      console.error('OAuth error:', error.response?.data || error.message);
      return reply.redirect(`${process.env.FRONTEND_URL}/auth/login?error=google_auth_failed`);
    }
  });
};
