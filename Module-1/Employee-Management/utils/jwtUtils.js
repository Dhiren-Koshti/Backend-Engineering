const jwt = require("jsonwebtoken");

const getJwtSecret = () =>
  process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || "1d";

/**
 * Generates a signed JWT token.
 * @param {Object} payload - Token payload (e.g. { id, role })
 * @returns {string} JWT token string
 */
const generateToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });
};

/**
 * Verifies a signed JWT token.
 * @param {string} token - JWT token string
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  generateToken,
  verifyToken,
};
