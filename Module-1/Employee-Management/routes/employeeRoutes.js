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
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Protect all employee routes with authentication middleware
router.use(authenticate);

// --- Read Operations (Accessible by both USER and ADMIN) ---
router.get("/", getAllEmployees);
router.get("/search", validateSearchQuery, searchEmployees);
router.get("/:id", validateId, getEmployeeById);

// --- Mutation Operations (Restricted to ADMIN only) ---
router.post("/", authorize("ADMIN"), validateCreateEmployee, createEmployee);
router.put(
  "/:id",
  authorize("ADMIN"),
  validateId,
  validateUpdateEmployee,
  updateEmployee
);
router.delete("/:id", authorize("ADMIN"), validateId, deleteEmployee);

module.exports = router;
