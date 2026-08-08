const AppError = require("../utils/AppError");

// In-memory employee array acting as database
const employees = [];
let nextId = 1;

/**
 * Creates a new employee with auto-increment ID and duplicate email validation.
 * @param {Object} employeeData - { name, email, department, role }
 * @returns {Object} Newly created employee
 */
const createEmployeeService = (employeeData) => {
  const { name, email, department, role } = employeeData;

  // Check for duplicate email (case-insensitive)
  const existingEmployee = employees.find(
    (emp) => emp.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (existingEmployee) {
    throw new AppError("Employee with this email already exists", 400);
  }

  // Generate new employee with auto-increment ID
  const newEmployee = {
    id: nextId++,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    department: department.trim(),
    role: role.trim(),
  };

  employees.push(newEmployee);
  return newEmployee;
};

/**
 * Retrieves all employees.
 * @returns {Array} List of all employees
 */
const getAllEmployeesService = () => {
  return employees;
};

/**
 * Retrieves a single employee by ID.
 * @param {number} id - Employee ID
 * @returns {Object} Employee object
 */
const getEmployeeByIdService = (id) => {
  const employee = employees.find((emp) => emp.id === Number(id));

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  return employee;
};

/**
 * Updates an existing employee by ID.
 * @param {number} id - Employee ID
 * @param {Object} updateData - Object containing updated fields
 * @returns {Object} Updated employee object
 */
const updateEmployeeService = (id, updateData) => {
  const numericId = Number(id);
  const employee = employees.find((emp) => emp.id === numericId);

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  // If email is being updated, check for duplicate email across other employees
  if (updateData.email !== undefined) {
    const trimmedEmail = updateData.email.trim().toLowerCase();
    const existingEmail = employees.find(
      (emp) => emp.email === trimmedEmail && emp.id !== numericId
    );

    if (existingEmail) {
      throw new AppError("Employee with this email already exists", 400);
    }
    updateData.email = trimmedEmail;
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
 * Deletes an employee by ID.
 * @param {number} id - Employee ID
 * @returns {Object} Deleted employee object
 */
const deleteEmployeeService = (id) => {
  const numericId = Number(id);
  const index = employees.findIndex((emp) => emp.id === numericId);

  if (index === -1) {
    throw new AppError("Employee not found", 404);
  }

  const [deletedEmployee] = employees.splice(index, 1);
  return deletedEmployee;
};

module.exports = {
  employees,
  createEmployeeService,
  getAllEmployeesService,
  getEmployeeByIdService,
  updateEmployeeService,
  deleteEmployeeService,
};
