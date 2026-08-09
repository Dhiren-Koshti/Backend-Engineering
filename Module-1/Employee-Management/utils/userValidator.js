const AppError = require("./AppError");

const validateUserName = (name) => {
  if (typeof name !== "string" || name.trim().length < 2) {
    throw new AppError("Name must be a string with at least 2 characters", 400);
  }
};

const validateUserEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    throw new AppError("Invalid email address", 400);
  }
};

const validateUserPassword = (password) => {
  if (typeof password !== "string") {
    throw new AppError("Password must be a string", 400);
  }

  const trimmedPassword = password.trim();

  // Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  if (!passwordRegex.test(trimmedPassword)) {
    throw new AppError(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      400
    );
  }
};

module.exports = {
  validateUserName,
  validateUserEmail,
  validateUserPassword,
};
