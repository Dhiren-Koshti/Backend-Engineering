const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**
 * Generates a signed JWT token.
 * @param {Object} payload - Token payload (e.g. { id, role })
 * @returns {string} JWT token string
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verifies a signed JWT token.
 * @param {string} token - JWT token string
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
