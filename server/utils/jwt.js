const jwt = require('jsonwebtoken');
const config = require('../config/default');

function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.tokenExpiresIn
  });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = {
  signToken,
  verifyToken
};

