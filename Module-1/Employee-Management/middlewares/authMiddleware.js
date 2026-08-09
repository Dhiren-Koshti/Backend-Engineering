const AppError = require("../utils/AppError");
const { verifyToken } = require("../utils/jwtUtils");
const { usersMap } = require("../services/userService");

/**
 * Authentication middleware.
 * 1. Extracts Bearer token from Authorization header.
 * 2. Validates the JWT token.
 * 3. Identifies the authenticated user.
 * 4. Attaches user info (without password) to req.user.
 * 5. Passes control to next middleware/controller.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication token is required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    // Find authenticated user in storage
    const user = usersMap.get(decoded.id);

    if (!user) {
      return next(
        new AppError("User belonging to this token no longer exists", 401)
      );
    }

    // Attach sanitized user information to request object
    const { password: _, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    next();
  } catch (error) {
    return next(new AppError("Invalid or expired authentication token", 401));
  }
};

/**
 * Authorization middleware for Role-Based Access Control (RBAC).
 * Restricts route access to users with specified roles.
 * @param {...string} allowedRoles - List of allowed roles (e.g. "ADMIN", "USER")
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
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
