const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");
const {
  validateRegisterUser,
  validateLoginUser,
} = require("../middlewares/validateUser");

router.post("/register", validateRegisterUser, registerUser);
router.post("/login", validateLoginUser, loginUser);

module.exports = router;
