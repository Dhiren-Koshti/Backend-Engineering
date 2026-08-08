const asyncHandler = require("../utils/asyncHandler");
const {
  createEmployeeService,
  getAllEmployeesService,
  getEmployeeByIdService,
  updateEmployeeService,
  deleteEmployeeService,
} = require("../services/employeeService");

const createEmployee = asyncHandler(async (req, res, next) => {
  const newEmployee = createEmployeeService(req.body);

  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    data: newEmployee,
  });
});

const getAllEmployees = asyncHandler(async (req, res, next) => {
  const employees = getAllEmployeesService();

  res.status(200).json({
    success: true,
    count: employees.length,
    message: "Employees fetched successfully",
    data: employees,
  });
});

const getEmployeeById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const employee = getEmployeeByIdService(id);

  res.status(200).json({
    success: true,
    message: "Employee fetched successfully",
    data: employee,
  });
});

const updateEmployee = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updatedEmployee = updateEmployeeService(id, req.body);

  res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    data: updatedEmployee,
  });
});

const deleteEmployee = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletedEmployee = deleteEmployeeService(id);

  res.status(200).json({
    success: true,
    message: "Employee deleted successfully",
    data: deletedEmployee,
  });
});

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
