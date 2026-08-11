module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/Employee-Management/tests/setup.js"],
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "Employee-Management/**/*.js",
    "!Employee-Management/node_modules/**",
    "!Employee-Management/benchmark.js",
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
