const path = require("path");

// Load .env.test if running in test environment, otherwise load .env
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
require("dotenv").config({ path: path.join(__dirname, "..", envFile) });

/**
 * Validates presence of required environment variables.
 * Implements the Fail-Fast principle: throws immediately if critical variables are missing.
 */
const validateEnv = () => {
  const requiredEnvVars = [
    { key: "JWT_SECRET", value: process.env.JWT_SECRET },
    { key: "ADMIN_EMAIL", value: process.env.ADMIN_EMAIL },
    { key: "ADMIN_PASSWORD", value: process.env.ADMIN_PASSWORD },
  ];

  const missingVars = requiredEnvVars.filter(
    (item) => !item.value || item.value.trim() === ""
  );

  if (missingVars.length > 0) {
    const missingKeys = missingVars.map((item) => item.key).join(", ");
    throw new Error(
      `[FATAL CONFIG ERROR] Missing required environment variable(s): ${missingKeys}. Please check your ${envFile} file.`
    );
  }
};

// Execute validation on module import (Fail-Fast)
validateEnv();

/**
 * Centralized Application Configuration Module
 */
const config = {
  port: Number(process.env.PORT) || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  saltRounds: Number(process.env.SALT_ROUNDS) || 10,
  admin: {
    name: process.env.ADMIN_NAME || "Super Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
};

module.exports = config;
