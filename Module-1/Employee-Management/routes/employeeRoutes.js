const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const {
  validateCreateEmployee,
  validateUpdateEmployee,
} = require("../middlewares/validateEmployee");
const validateId = require("../middlewares/validateId");

router.post("/", validateCreateEmployee, createEmployee);
router.get("/", getAllEmployees);
router.get("/:id", validateId, getEmployeeById);
router.put("/:id", validateId, validateUpdateEmployee, updateEmployee);
router.delete("/:id", validateId, deleteEmployee);

module.exports = router;
