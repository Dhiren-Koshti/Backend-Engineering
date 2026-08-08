const AppError = require("../utils/AppError");
const {
  validateEmployeeName,
  validateEmployeeEmail,
  validateEmployeeDepartment,
  validateEmployeeRole,
} = require("../utils/employeeValidator");

const EMPLOYEE_FIELDS = {
  name: validateEmployeeName,
  email: validateEmployeeEmail,
  department: validateEmployeeDepartment,
  role: validateEmployeeRole,
};

const ALLOWED_FIELDS = Object.keys(EMPLOYEE_FIELDS);

const isValidBody = (body) => {
  return (
    body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    Object.keys(body).length > 0
  );
};

const getInvalidFields = (body, allowedFields) => {
  return Object.keys(body).filter((field) => !allowedFields.includes(field));
};

const getMissingFields = (body, requiredFields) => {
  return requiredFields.filter((field) => {
    const value = body[field];

    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    );
  });
};

const validateFieldValues = (body) => {
  for (const [field, validator] of Object.entries(EMPLOYEE_FIELDS)) {
    if (body[field] !== undefined) {
      validator(body[field]);
    }
  }
};

const validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    const { body } = req;

    if (!isValidBody(body)) {
      return next(new AppError("Request body must be a non-empty object", 400));
    }

    const invalidFields = getInvalidFields(body, ALLOWED_FIELDS);

    if (invalidFields.length) {
      return next(
        new AppError(`Fields not allowed: ${invalidFields.join(", ")}`, 400)
      );
    }

    const missingFields = getMissingFields(body, requiredFields);

    if (missingFields.length) {
      return next(
        new AppError(
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        )
      );
    }

    validateFieldValues(body);

    next();
  };
};

const validateCreateEmployee = validateBody(ALLOWED_FIELDS);

const validateUpdateEmployee = validateBody();

module.exports = {
  validateBody,
  validateCreateEmployee,
  validateUpdateEmployee,
};
