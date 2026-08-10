const AppError = require("../utils/AppError");
const { verifyToken } = require("../utils/jwtUtils");
const { usersMap } = require("../services/userService");
const logger = require("../utils/logger");

/**
 * Authentication middleware.
 * Extracts Bearer token, validates JWT, attaches sanitized user to req.user.
 * Logs authentication failures.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn(
      `Authentication failure on ${req.method} ${req.originalUrl}: Token missing or malformed`
    );
    return next(new AppError("Authentication token is required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    // Find authenticated user in storage
    const user = usersMap.get(decoded.id);

    if (!user) {
      logger.warn(
        `Authentication failure on ${req.method} ${req.originalUrl}: User ID ${decoded.id} no longer exists`
      );
      return next(
        new AppError("User belonging to this token no longer exists", 401)
      );
    }

    // Attach sanitized user information to request object
    const { password: _, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    next();
  } catch (error) {
    logger.warn(
      `Authentication failure on ${req.method} ${req.originalUrl}: ${error.message}`
    );
    return next(new AppError("Invalid or expired authentication token", 401));
  }
};

/**
 * Authorization middleware for Role-Based Access Control (RBAC).
 * Restricts route access to users with specified roles.
 * Logs authorization failures.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Authorization failure on ${req.method} ${req.originalUrl}: User '${req.user?.email}' with role '${req.user?.role}' requires role [${allowedRoles.join(", ")}]`
      );
      return next(
        new AppError(
          "Forbidden: You do not have permission to perform this action",
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
