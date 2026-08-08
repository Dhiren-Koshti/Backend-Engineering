const AppError = require("./AppError");

const validateEmployeeName = (name) => {
  if (typeof name !== "string" || name.trim().length < 2) {
    throw new AppError("Name must be a string with at least 2 characters", 400);
  }
};

const validateEmployeeEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    throw new AppError("Invalid email address", 400);
  }
};

const validateEmployeeDepartment = (department) => {
  if (typeof department !== "string" || department.trim().length === 0) {
    throw new AppError("Department must be a non-empty string", 400);
  }
};

const validateEmployeeRole = (role) => {
  if (typeof role !== "string" || role.trim().length === 0) {
    throw new AppError("Role must be a non-empty string", 400);
  }
};

module.exports = {
  validateEmployeeName,
  validateEmployeeEmail,
  validateEmployeeDepartment,
  validateEmployeeRole,
};
