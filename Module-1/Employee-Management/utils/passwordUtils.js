const bcrypt = require("bcryptjs");
const config = require("../config/config");

/**
 * Hashes a plain text password.
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password string
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, config.saltRounds);
};

/**
 * Compares a plain text password against a hashed password.
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password stored in database
 * @returns {Promise<boolean>} True if matching, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
