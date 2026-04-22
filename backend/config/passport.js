const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

function setupPassport(fastify) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const googleId = profile.id;
          
          return done(null, { email, googleId, profile });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

module.exports = setupPassport;
