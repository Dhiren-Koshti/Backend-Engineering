const AppError = require("../utils/AppError");
const {
  validateUserName,
  validateUserEmail,
  validateUserPassword,
} = require("../utils/userValidator");

const REGISTER_USER_FIELDS = {
  name: validateUserName,
  email: validateUserEmail,
  password: validateUserPassword,
};

const ALLOWED_REGISTER_FIELDS = Object.keys(REGISTER_USER_FIELDS);

const ALLOWED_LOGIN_FIELDS = ["email", "password"];

const LOGIN_USER_FIELDS = {
  email: validateUserEmail,
  password: (password) => {
    if (typeof password !== "string" || password.trim().length === 0) {
      throw new AppError("Password must be a non-empty string", 400);
    }
  },
};

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

const validateFieldValues = (body, fieldsSchema) => {
  for (const [field, validator] of Object.entries(fieldsSchema)) {
    if (body[field] !== undefined) {
      validator(body[field]);
    }
  }
};

const validateRegisterUser = (req, res, next) => {
  const { body } = req;

  if (!isValidBody(body)) {
    return next(new AppError("Request body must be a non-empty object", 400));
  }

  const invalidFields = getInvalidFields(body, ALLOWED_REGISTER_FIELDS);

  if (invalidFields.length) {
    return next(
      new AppError(`Fields not allowed: ${invalidFields.join(", ")}`, 400)
    );
  }

  const missingFields = getMissingFields(body, ALLOWED_REGISTER_FIELDS);

  if (missingFields.length) {
    return next(
      new AppError(`Missing required fields: ${missingFields.join(", ")}`, 400)
    );
  }

  validateFieldValues(body, REGISTER_USER_FIELDS);

  next();
};

const validateLoginUser = (req, res, next) => {
  const { body } = req;

  if (!isValidBody(body)) {
    return next(new AppError("Request body must be a non-empty object", 400));
  }

  const invalidFields = getInvalidFields(body, ALLOWED_LOGIN_FIELDS);

  if (invalidFields.length) {
    return next(
      new AppError(`Fields not allowed: ${invalidFields.join(", ")}`, 400)
    );
  }

  const missingFields = getMissingFields(body, ALLOWED_LOGIN_FIELDS);

  if (missingFields.length) {
    return next(
      new AppError(`Missing required fields: ${missingFields.join(", ")}`, 400)
    );
  }

  validateFieldValues(body, LOGIN_USER_FIELDS);

  next();
};

module.exports = {
  validateRegisterUser,
  validateLoginUser,
};
