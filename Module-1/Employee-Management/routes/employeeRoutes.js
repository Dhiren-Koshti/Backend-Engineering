const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
} = require("../controllers/employeeController");
const {
  validateCreateEmployee,
  validateUpdateEmployee,
  validateSearchQuery,
} = require("../middlewares/validateEmployee");
const validateId = require("../middlewares/validateId");

router.post("/", validateCreateEmployee, createEmployee);
router.get("/", getAllEmployees);
router.get("/search", validateSearchQuery, searchEmployees);
router.get("/:id", validateId, getEmployeeById);
router.put("/:id", validateId, validateUpdateEmployee, updateEmployee);
router.delete("/:id", validateId, deleteEmployee);

module.exports = router;
