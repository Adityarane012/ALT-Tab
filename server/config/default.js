module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'changeme-in-production',
  tokenExpiresIn: '7d'
};

