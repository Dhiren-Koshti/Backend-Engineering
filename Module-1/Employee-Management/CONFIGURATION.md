# Configuration & Logging Documentation

This document details the design architecture, validation mechanisms, security rules, and engineering choices behind **Configuration Management** and **Application Logging** in the Employee Management System.

---

## 1. How Configuration Is Loaded

Environment configuration is managed via a centralized configuration module located at `config/config.js`.

1. **Environment File Resolution**: Upon application boot, `dotenv` loads environment variables from `Employee-Management/.env` using path resolution (`path.join(__dirname, "../.env")`).
2. **Centralized Export**: All environment variables are structured and exported from `config/config.js`.
3. **Decoupled Application Logic**: Application files (controllers, services, utilities, server) **never read `process.env` directly**. Instead, all components import `config/config.js`.

```javascript
const config = require("./config/config");

// Usage example
app.listen(config.port, () => ...);
```

---

## 2. How Required Configuration Is Validated (Fail-Fast Principle)

To ensure operational stability and security, the configuration module implements the **Fail-Fast** design pattern via `validateEnv()`:

1. **Execution on Import**: `validateEnv()` executes synchronously when `config/config.js` is imported.
2. **Required Variable Checks**: The validator verifies that mandatory configuration keys are present and non-empty:
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
3. **Immediate Server Termination**: If any required variable is missing or blank, `validateEnv()` throws a fatal configuration error (`[FATAL CONFIG ERROR]`), halting process startup immediately before port binding.

---

## 3. Why Secrets Do Not Have Fallback Values

Providing fallback values (e.g. `default_secret_key` or `admin123`) for secrets is a major security vulnerability in production applications:

1. **Prevents Insecure Production Deployments**: Fallback values allow applications to boot silently with hardcoded defaults. If deployed to production without configuring `.env`, attackers could forge JWT tokens or compromise Admin accounts.
2. **Enforces Explicit Configuration**: Requiring secrets forces developers and DevOps engineers to explicitly provide environment-specific secrets across development, staging, and production environments.
3. **Fail-Safe Security**: Halting execution when a secret is missing guarantees that the application cannot run in an insecure state.

---

## 4. How Logging Works

Application logging is powered by a structured logging system (`utils/logger.js`) and HTTP request middleware (`middlewares/requestLogger.js`):

### Standardized Format
Log output includes ISO timestamps, log levels, and event details:
`[LEVEL] [ISO Timestamp] Message`

### Log Levels & Status Routing
- **`[INFO]`**: Operational events, server startup, and successful HTTP requests (`2xx` / `3xx`).
- **`[WARN]`**: Client operational errors (`4xx`), authentication failures, and authorization denials.
- **`[ERROR]`**: Unexpected server errors (`5xx`) and fatal startup failures.

### HTTP Request Logging (`requestLogger.js`)
Request logging uses Express `res.on("finish")` listeners to compute request duration:

```text
[INFO] [2026-08-10T05:47:31.000Z] GET /employees 200 8ms
[WARN] [2026-08-10T05:47:35.000Z] POST /employees 401 3ms
[ERROR] [2026-08-10T05:47:40.000Z] GET /employees/999 500 15ms
```

---

## 5. What Information Is Intentionally Excluded From Logs

To protect user privacy and system security, the logger utility (`utils/logger.js`) includes a recursive **Sanitization Engine** that automatically redacts sensitive data before writing to output streams:

### Intentionally Excluded & Masked Information:
- **Passwords**: Plaintext passwords are never logged.
- **Password Hashes**: Encrypted bcrypt hashes are excluded.
- **JWT Tokens & Bearer Headers**: Intercepted by regex pattern matching and masked to `Bearer [REDACTED]`.
- **JWT Secrets**: Banned from all log messages.
- **Request Payloads (`req.body`) & Headers (`req.headers`)**: Omitted from HTTP request logging to prevent accidental PII or secret exposure.

---

## 6. Why We Chose Our Logging Approach

We chose a **Custom Built-In Logging Middleware** over external packages (`morgan` or `pino-http`) for the following reasons:

1. **Zero External Dependencies**: Eliminates third-party package overhead, security vulnerability surface, and dependency management.
2. **Unified Security Redaction**: Direct integration with `logger.js` guarantees that all log output passes through automated redaction rules.
3. **High Performance**: Native Node.js timing (`Date.now()`) adds negligible overhead to request processing.
