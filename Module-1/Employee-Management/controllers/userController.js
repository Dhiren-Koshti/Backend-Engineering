const asyncHandler = require("../utils/asyncHandler");
const {
  registerUserService,
  loginUserService,
} = require("../services/userService");

const registerUser = asyncHandler(async (req, res, next) => {
  const newUser = await registerUserService(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: newUser,
  });
});

const loginUser = asyncHandler(async (req, res, next) => {
  const result = await loginUserService(req.body);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: {
      user: result.user,
      token: result.token,
    },
  });
});

module.exports = {
  registerUser,
  loginUser,
};
