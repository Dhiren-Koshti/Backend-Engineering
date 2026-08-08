const AppError = require("../utils/AppError");

// In-memory data store using JavaScript Maps for O(1) time complexity
const employeesMap = new Map(); // id -> employee object
const emailMap = new Map();     // email.toLowerCase() -> id
let nextId = 1;

/**
 * Creates a new employee in O(1) time.
 * @param {Object} employeeData - { name, email, department, role }
 * @returns {Object} Newly created employee
 */
const createEmployeeService = (employeeData) => {
  const { name, email, department, role } = employeeData;
  const normalizedEmail = email.trim().toLowerCase();

  // O(1) duplicate email lookup
  if (emailMap.has(normalizedEmail)) {
    throw new AppError("Employee with this email already exists", 400);
  }

  const id = nextId++;
  const newEmployee = {
    id,
    name: name.trim(),
    email: normalizedEmail,
    department: department.trim(),
    role: role.trim(),
  };

  // O(1) insertion in both maps
  employeesMap.set(id, newEmployee);
  emailMap.set(normalizedEmail, id);

  return newEmployee;
};

/**
 * Retrieves all employees.
 * @returns {Array} List of all employees
 */
const getAllEmployeesService = () => {
  return Array.from(employeesMap.values());
};

/**
 * Retrieves a single employee by ID in O(1) time.
 * @param {number} id - Employee ID
 * @returns {Object} Employee object
 */
const getEmployeeByIdService = (id) => {
  const numericId = Number(id);
  const employee = employeesMap.get(numericId); // O(1) lookup

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  return employee;
};

/**
 * Updates an existing employee by ID in O(1) time.
 * @param {number} id - Employee ID
 * @param {Object} updateData - Object containing updated fields
 * @returns {Object} Updated employee object
 */
const updateEmployeeService = (id, updateData) => {
  const numericId = Number(id);
  const employee = employeesMap.get(numericId); // O(1) lookup

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  // Handle email update and re-indexing in emailMap
  if (updateData.email !== undefined) {
    const newEmail = updateData.email.trim().toLowerCase();
    const existingId = emailMap.get(newEmail); // O(1) lookup

    if (existingId !== undefined && existingId !== numericId) {
      throw new AppError("Employee with this email already exists", 400);
    }

    // Update emailMap index
    emailMap.delete(employee.email);
    emailMap.set(newEmail, numericId);
    updateData.email = newEmail;
  }

  // Trim string values in updateData
  Object.keys(updateData).forEach((key) => {
    if (typeof updateData[key] === "string") {
      updateData[key] = updateData[key].trim();
    }
  });

  // Merge updateData directly into the existing employee object
  Object.assign(employee, updateData);

  return employee;
};

/**
 * Deletes an employee by ID in O(1) time.
 * @param {number} id - Employee ID
 * @returns {Object} Deleted employee object
 */
const deleteEmployeeService = (id) => {
  const numericId = Number(id);
  const employee = employeesMap.get(numericId); // O(1) lookup

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  // O(1) deletion from both maps
  emailMap.delete(employee.email);
  employeesMap.delete(numericId);

  return employee;
};

module.exports = {
  employeesMap,
  emailMap,
  createEmployeeService,
  getAllEmployeesService,
  getEmployeeByIdService,
  updateEmployeeService,
  deleteEmployeeService,
};
