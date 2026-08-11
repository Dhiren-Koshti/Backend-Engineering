# Automated Testing Documentation (`TESTING.md`)

This document outlines the testing strategy, tools chosen, folder organization, state isolation design, error boundary assertions, and code coverage analysis for the **Employee Management System**.

---

## 1. Testing Tools & Framework Selection

### Primary Testing Tools
1. **Jest (`v29+`)**: Selected as the primary test runner, assertion framework (`expect`), mocking utility (`jest.fn()`), and code coverage reporter.
   - **Why Jest?**: Industry standard for Node.js applications; provides an all-in-one ecosystem (assertions, mocking, parallel test execution, and coverage) out of the box without needing extra dependencies like Mocha, Chai, or Sinon.
2. **Supertest (`v7+`)**: Selected for HTTP integration testing.
   - **Why Supertest?**: De facto standard for testing Express HTTP controllers and routes directly in-memory without needing to bind physical TCP network sockets.

---

## 2. Test Suite Categories & Organization

Tests are organized inside a dedicated `tests/` directory:

```text
Employee-Management/
├── .env.test                   # Isolated test environment settings
├── jest.config.js              # Jest configuration
├── TESTING.md                  # Detailed testing documentation
└── tests/
    ├── setup.js                # Global setup & state reset hook (beforeEach)
    ├── unit/                   # Unit Tests (Independent of HTTP)
    │   ├── passwordUtils.test.js
    │   ├── jwtUtils.test.js
    │   ├── userService.test.js
    │   └── employeeService.test.js
    └── integration/            # API Integration & Authorization Tests
        ├── auth.test.js        # POST /auth/register & POST /auth/login
        ├── employees.test.js   # GET, POST, PUT, DELETE /employees & search
        ├── rbac.test.js        # USER vs ADMIN permission checks (403 Forbidden)
        └── errorBoundary.test.js # GET /test-error (500 Error boundary check)
```

---

## 3. Test Isolation & State Management Strategy

### The In-Memory Challenge
Because the application uses in-memory JavaScript `Map` structures (`employeesMap`, `usersMap`), data persists across operations during Node.js process execution. Naively clearing all maps between tests would wipe out the seeded Super Admin user required for authentication/authorization tests.

### The Solution (`resetTestState`)
1. **Dedicated Reset Helpers**:
   - `resetUserServiceState()`: Clears user maps (`usersMap`, `userEmailMap`), resets user IDs to `1`, and asynchronously re-seeds the Super Admin account.
   - `resetEmployeeServiceState()`: Clears employee maps (`employeesMap`, `emailMap`) and resets employee IDs to `1`.
2. **Lifecycle Execution (`beforeEach`)**:
   - Executed in `tests/setup.js` before **every single test case**:
     ```javascript
     beforeEach(async () => {
       resetEmployeeServiceState();
       await resetUserServiceState();
     });
     ```
   - **Benefit**: Every test executes against a pristine, predictable environment where employee lists are empty and the Super Admin is cleanly seeded.

---

## 4. Test Environment Isolation

1. **Dedicated Test Configuration (`.env.test`)**:
   - All tests execute with `NODE_ENV=test`.
   - `config/config.js` dynamically loads `.env.test` when `NODE_ENV === 'test'`.
2. **Bcrypt Speed Optimization**:
   - `SALT_ROUNDS=1` in `.env.test` accelerates password hashing during automated testing by ~100x while maintaining 100% of the bcrypt cryptographic workflow.
3. **No Personal Environment Dependencies**:
   - Automated tests run autonomously in CI/CD environments without requiring developer-specific local `.env` files.

---

## 5. Behavior-Driven Testing vs. Implementation Details

In accordance with clean testing principles:
- **No Implementation Coupling**: Tests do **not** assert internal storage details (e.g., `expect(employeesMap.size).toBe(3)`).
- **Public Contract Assertions**: Tests interact with the system strictly via service methods and HTTP endpoints:
  ```text
  POST /employees -> 201 Created -> GET /employees/:id -> 200 OK
  ```
- **Refactoring Resilience**: If in-memory Maps are replaced with a persistent database (e.g., MongoDB or PostgreSQL), the integration test suite will remain 100% valid without requiring test code rewrites.

---

## 6. Error Boundary Testing (`GET /test-error`)

A dedicated test endpoint (`GET /test-error`) is mounted when `NODE_ENV === 'test'`.

### Assertions:
1. **Status Code**: Returns `500 Internal Server Error`.
2. **Client Response Payload**:
   ```json
   {
     "success": false,
     "error": {
       "code": "INTERNAL_SERVER_ERROR",
       "message": "Internal server error"
     }
   }
   ```
3. **Information Disclosure Prevention**: Verified that client response does **NOT** expose stack traces (`stack`), filesystem paths, or internal error messages.

---

## 7. Code Coverage Inspection & Uncovered Areas Analysis

### Coverage Metrics Summary
- **Statements**: `90.21%`
- **Branches**: `74.17%`
- **Functions**: `94.59%`
- **Lines**: `90.34%`
- **Controllers & Routes**: `100%`

### Analysis of Uncovered Areas

#### Area 1: `server.js` Port Listening Listener (Lines 36-39)
* **Why it isn't covered**: `server.js` conditionally bypasses `app.listen(PORT)` when imported as a module by Supertest. Supertest inspects Express route handlers directly in memory without binding TCP ports.
* **What would be tested later**: E2E process tests spawning standalone background child processes (`child_process.fork('server.js')`) to verify port binding and OS signal handling (`SIGINT`/`SIGTERM`).

#### Area 2: `config/config.js` Fatal Missing Environment Validation (Lines 23-24)
* **Why it isn't covered**: Environment validation runs synchronously on module import. Because `.env.test` is populated during test suite execution, the failure branch throwing `[FATAL CONFIG ERROR]` is not triggered during normal test runs.
* **What would be tested later**: Isolated module import tests using `jest.isolateModules()` and `jest.resetModules()` with empty `process.env` keys (`delete process.env.JWT_SECRET`) to test fatal startup aborts.

#### Area 3: `validateEmployee.js` & `validateUser.js` Unused Validation Guard Clauses
* **Why it isn't covered**: Defensive fallback checks for edge cases (such as non-object body inputs or unexpected request formats) that are already sanitized earlier in Express middleware.
* **What would be tested later**: Fuzzing tests passing malformed non-JSON raw buffers directly to validation functions.

---

## 8. Executing Tests & Coverage

### Run Full Test Suite
```bash
npm test
```

### Run Coverage Report
```bash
npm run test:coverage
```
