const request = require("supertest");
const app = require("../../server");
const config = require("../../config/config");

describe("Authentication API Integration Tests (POST /auth/*)", () => {
  describe("POST /auth/register", () => {
    it("should successfully register a new user with 201 Created and sanitized response", async () => {
      const payload = {
        name: "Test User",
        email: "testuser@company.com",
        password: "Password@123",
      };

      const res = await request(app)
        .post("/auth/register")
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.name).toBe("Test User");
      expect(res.body.data.email).toBe("testuser@company.com");
      expect(res.body.data.role).toBe("USER");
      expect(res.body.data.password).toBeUndefined();
    });

    it("should fail registration with 400 Bad Request when password lacks complexity", async () => {
      const payload = {
        name: "Weak User",
        email: "weak@company.com",
        password: "weak",
      };

      const res = await request(app)
        .post("/auth/register")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });

    it("should fail registration with 400 Bad Request on duplicate email", async () => {
      const payload = {
        name: "Duplicate User",
        email: "dup@company.com",
        password: "Password@123",
      };

      await request(app).post("/auth/register").send(payload).expect(201);

      const res = await request(app)
        .post("/auth/register")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already exists");
    });

    it("should reject extra/unsupported fields with 400 Bad Request", async () => {
      const payload = {
        name: "Hacker",
        email: "hacker@company.com",
        password: "Password@123",
        role: "ADMIN", // Disallowed extra field
      };

      const res = await request(app)
        .post("/auth/register")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /auth/login", () => {
    it("should successfully authenticate valid admin credentials and return JWT token", async () => {
      const payload = {
        email: config.admin.email,
        password: config.admin.password,
      };

      const res = await request(app)
        .post("/auth/login")
        .send(payload)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(config.admin.email.toLowerCase());
      expect(res.body.data.user.role).toBe("ADMIN");
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should return 401 Unauthorized for incorrect password", async () => {
      const payload = {
        email: config.admin.email,
        password: "WrongPassword@999",
      };

      const res = await request(app)
        .post("/auth/login")
        .send(payload)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return 401 Unauthorized for non-existent email", async () => {
      const payload = {
        email: "nonexistent@company.com",
        password: "Password@123",
      };

      const res = await request(app)
        .post("/auth/login")
        .send(payload)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });
});
