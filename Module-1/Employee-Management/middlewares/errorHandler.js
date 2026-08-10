const logger = require("../utils/logger");

/**
 * Global Error Handler Middleware
 * - Operational (4xx) Errors: Returns user-friendly error message to client.
 * - Unexpected (500) Errors: Logs complete diagnostic info (stack trace, user context, route)
 *   to server logs while concealing internal details from the client.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Operational client error (e.g., 400, 401, 403, 404)
  if (isOperational && statusCode < 500) {
    return res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unexpected Application Error (500)
  // Log full diagnostic data on server side for investigation
  logger.error(
    `Unexpected application error on ${req.method} ${req.originalUrl}: ${err.message}`,
    {
      method: req.method,
      url: req.originalUrl,
      user: req.user ? { id: req.user.id, email: req.user.email } : "Anonymous",
      name: err.name,
      message: err.message,
      stack: err.stack,
    }
  );

  // Return clean, unexposed payload to client
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  });
};

module.exports = errorHandler;
