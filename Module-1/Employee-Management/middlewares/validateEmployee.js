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

// --- Query Parameter Validation for Search API ---

const ALLOWED_SEARCH_QUERY_PARAMS = [
  "name",
  "department",
  "role",
  "page",
  "limit",
];

const validateSearchQuery = (req, res, next) => {
  const query = req.query;

  // 1. Check for unallowed query parameters
  const invalidQueryParams = Object.keys(query).filter(
    (param) => !ALLOWED_SEARCH_QUERY_PARAMS.includes(param)
  );

  if (invalidQueryParams.length > 0) {
    return next(
      new AppError(
        `Query parameters not allowed: ${invalidQueryParams.join(", ")}`,
        400
      )
    );
  }

  // 2. Validate string parameters if provided
  if (query.name !== undefined) {
    if (typeof query.name !== "string" || query.name.trim().length === 0) {
      return next(
        new AppError("Query parameter 'name' must be a non-empty string", 400)
      );
    }
  }

  if (query.department !== undefined) {
    if (
      typeof query.department !== "string" ||
      query.department.trim().length === 0
    ) {
      return next(
        new AppError(
          "Query parameter 'department' must be a non-empty string",
          400
        )
      );
    }
  }

  if (query.role !== undefined) {
    if (typeof query.role !== "string" || query.role.trim().length === 0) {
      return next(
        new AppError("Query parameter 'role' must be a non-empty string", 400)
      );
    }
  }

  // 3. Validate pagination parameters if provided
  if (query.page !== undefined) {
    const pageNum = Number(query.page);
    if (!Number.isInteger(pageNum) || pageNum <= 0) {
      return next(
        new AppError("Query parameter 'page' must be a positive integer", 400)
      );
    }
  }

  if (query.limit !== undefined) {
    const limitNum = Number(query.limit);
    if (!Number.isInteger(limitNum) || limitNum <= 0) {
      return next(
        new AppError("Query parameter 'limit' must be a positive integer", 400)
      );
    }
  }

  next();
};

module.exports = {
  validateBody,
  validateCreateEmployee,
  validateUpdateEmployee,
  validateSearchQuery,
};
