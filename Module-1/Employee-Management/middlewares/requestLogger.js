const logger = require("../utils/logger");

/**
 * Custom Request Logging Middleware
 * Captures timestamp, HTTP method, request path, response status, and duration (ms).
 * Output format: [ISO Timestamp] METHOD PATH STATUS DURATIONms
 * Example: [INFO] [2026-08-10T05:47:31.000Z] GET /employees 200 8ms
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    const logMessage = `${method} ${originalUrl} ${statusCode} ${duration}ms`;

    if (statusCode >= 500) {
      logger.error(logMessage);
    } else if (statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }
  });

  next();
};

module.exports = requestLogger;
