process.env.NODE_ENV = "test";

const { resetUserServiceState } = require("../services/userService");
const { resetEmployeeServiceState } = require("../services/employeeService");

/**
 * Global Test Setup
 * Resets all in-memory maps and re-seeds Super Admin before every test case to ensure 100% test isolation.
 */
beforeEach(async () => {
  resetEmployeeServiceState();
  await resetUserServiceState();
});
