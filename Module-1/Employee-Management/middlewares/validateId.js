const AppError = require("../utils/AppError");

/**
 * Middleware to validate req.params.id as a positive integer.
 */
const validateId = (req, res, next) => {
  const { id } = req.params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return next(
      new AppError("Invalid employee ID. ID must be a positive integer", 400)
    );
  }

  req.params.id = numericId;
  next();
};

module.exports = validateId;
