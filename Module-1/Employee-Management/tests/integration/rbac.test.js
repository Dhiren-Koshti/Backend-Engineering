const request = require("supertest");
const app = require("../../server");
const config = require("../../config/config");

describe("Role-Based Access Control (RBAC) Authorization Integration Tests", () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    // 1. Get ADMIN token
    const adminLoginRes = await request(app).post("/auth/login").send({
      email: config.admin.email,
      password: config.admin.password,
    });
    adminToken = adminLoginRes.body.data.token;

    // 2. Register regular USER and get USER token
    await request(app).post("/auth/register").send({
      name: "Regular User",
      email: "regular@company.com",
      password: "UserPassword@123",
    });

    const userLoginRes = await request(app).post("/auth/login").send({
      email: "regular@company.com",
      password: "UserPassword@123",
    });
    userToken = userLoginRes.body.data.token;
  });

  describe("Unauthenticated Access (No / Invalid Token)", () => {
    it("should return 401 Unauthorized when no Authorization header is provided", async () => {
      const res = await request(app).get("/employees").expect(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Authentication token is required");
    });

    it("should return 401 Unauthorized when token is invalid or corrupted", async () => {
      const res = await request(app)
        .get("/employees")
        .set("Authorization", "Bearer invalid_token_123")
        .expect(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid or expired authentication token");
    });
  });

  describe("USER Role Permissions", () => {
    it("USER → GET /employees should be ALLOWED (200 OK)", async () => {
      await request(app)
        .get("/employees")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
    });

    it("USER → GET /employees/search should be ALLOWED (200 OK)", async () => {
      await request(app)
        .get("/employees/search")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
    });

    it("USER → POST /employees should be BLOCKED (403 Forbidden)", async () => {
      const res = await request(app)
        .post("/employees")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Test Emp",
          email: "testemp@company.com",
          department: "IT",
          role: "Developer",
        })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Forbidden");
    });

    it("USER → PUT /employees/:id should be BLOCKED (403 Forbidden)", async () => {
      const res = await request(app)
        .put("/employees/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Updated Name" })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Forbidden");
    });

    it("USER → DELETE /employees/:id should be BLOCKED (403 Forbidden)", async () => {
      const res = await request(app)
        .delete("/employees/1")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Forbidden");
    });
  });

  describe("ADMIN Role Permissions", () => {
    it("ADMIN → GET /employees should be ALLOWED (200 OK)", async () => {
      await request(app)
        .get("/employees")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
    });

    it("ADMIN → POST /employees should be ALLOWED (201 Created)", async () => {
      await request(app)
        .post("/employees")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Admin Created Emp",
          email: "admincreated@company.com",
          department: "Operations",
          role: "Operations Lead",
        })
        .expect(201);
    });

    it("ADMIN → PUT /employees/:id should be ALLOWED (200 OK)", async () => {
      const createRes = await request(app)
        .post("/employees")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Emp To Update",
          email: "toupdate@company.com",
          department: "Sales",
          role: "Sales Rep",
        });

      const empId = createRes.body.data.id;

      await request(app)
        .put(`/employees/${empId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "Sales Manager" })
        .expect(200);
    });

    it("ADMIN → DELETE /employees/:id should be ALLOWED (200 OK)", async () => {
      const createRes = await request(app)
        .post("/employees")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Emp To Delete",
          email: "todelete@company.com",
          department: "Sales",
          role: "Sales Rep",
        });

      const empId = createRes.body.data.id;

      await request(app)
        .delete(`/employees/${empId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
