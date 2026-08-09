# Authentication & Authorization Documentation

This document outlines the architecture, engineering decisions, and operational details of the **User Authentication** and **Role-Based Access Control (RBAC)** system implemented in the Employee Management System.

---

## 1. Overview & Architecture

The system implements a stateless, token-based authentication mechanism using **JSON Web Tokens (JWT)** and **bcrypt** password hashing. Access to API endpoints is controlled via middleware layers that enforce identity verification and role authorization.

### Request Flow
```text
Client Request ➔ Route ➔ Validation Middleware ➔ Auth Middleware (JWT) ➔ Authorization Middleware (RBAC) ➔ Controller ➔ Service
```

---

## 2. Engineering Decisions

### Decision 1: Admin User Creation Mechanism

#### Problem & Security Consideration
Public registration endpoints (`POST /auth/register`) must **never** permit clients to specify a `role` field. Accepting `role` from untrusted client requests introduces a severe **Privilege Escalation** vulnerability, allowing malicious actors to register as `ADMIN`.

#### Chosen Engineering Strategy: Startup Initialization / Seeding
To solve this securely, we adopted **Automated Startup Database Seeding**:

1. **Default Role Enforcement**: All users registered via `POST /auth/register` are strictly assigned the `USER` role by the backend logic. Client payload inputs attempting to provide `role` are rejected by validation middleware.
2. **Automated Admin Seeding**: Upon server startup (`server.js`), the application executes `seedAdminUser()`. It checks if a Super Admin exists; if missing, it seeds an initial `ADMIN` account using environment credentials configured in `.env`.
3. **Password Security**: The seeded Admin password is encrypted via `bcrypt` (10 salt rounds) before being stored in memory.

---

### Decision 2: Password Validation Strategy (Registration vs. Login)

#### Registration (`POST /auth/register`)
Enforces **strict complexity rules** (minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character). This ensures all new accounts adhere to high security standards.

#### Login (`POST /auth/login`)
Validates only that `password` is a **non-empty string**, deliberately omitting strict complexity rules.

#### Rationale for Login Validation Design:
1. **Backward Compatibility**: If password complexity policies evolve over time (e.g. increasing length or symbol requirements), existing users registered under previous policies would be blocked at the validation layer and unable to log in.
2. **Security & Information Leakage**: Performing strict complexity checks on login payloads could expose details about password criteria to malicious actors attempting credential stuffing attacks.
3. **Single Responsibility**: The login endpoint's primary responsibility is to pass the user's string to `bcrypt.compare()` for cryptographic verification against the stored hash.

---

## 3. Endpoints & Permissions (RBAC Matrix)

### Public Endpoints
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/register` | `POST` | Register a new user (`USER` role) |
| `/auth/login` | `POST` | Authenticate and obtain JWT token |

### Protected Endpoints (`/employees`)
All `/employees` endpoints require a valid JWT token sent in the HTTP header:
`Authorization: Bearer <token>`

| Endpoint | Method | Required Role | HTTP Status on Unauthorized / Forbidden |
| :--- | :--- | :--- | :--- |
| `/employees` | `GET` | `USER` or `ADMIN` | `401 Unauthorized` |
| `/employees/search` | `GET` | `USER` or `ADMIN` | `401 Unauthorized` |
| `/employees/:id` | `GET` | `USER` or `ADMIN` | `401 Unauthorized` |
| `/employees` | `POST` | `ADMIN` | `403 Forbidden` (if `USER`) |
| `/employees/:id` | `PUT` | `ADMIN` | `403 Forbidden` (if `USER`) |
| `/employees/:id` | `DELETE` | `ADMIN` | `403 Forbidden` (if `USER`) |

---

## 4. Environment Variables (`.env`)

The system relies on central environment variables for security and operational parameters:

```env
# Server Port
PORT=3000

# Security Tokens & Hashing
JWT_SECRET=super_secret_jwt_key_employee_management_2026
JWT_EXPIRES_IN=1d
SALT_ROUNDS=10

# Super Admin Startup Seed Credentials
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=Admin@12345
```

---

## 5. Security Best Practices Summary

- **Stateless Verification**: Passwords are never stored in plain text.
- **Sanitized Responses**: Sensitive fields (`password`) are omitted from all JSON API responses.
- **Fail-Safe Defaults**: Non-existent tokens yield `401 Unauthorized`, while role mismatches yield `403 Forbidden`.
