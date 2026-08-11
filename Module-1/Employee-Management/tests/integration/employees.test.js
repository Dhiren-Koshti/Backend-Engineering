const request = require("supertest");
const app = require("../../server");
const config = require("../../config/config");

describe("Employee API Integration Tests (/employees/*)", () => {
  let adminToken;

  beforeEach(async () => {
    // Authenticate as Admin to obtain Bearer token for setup
    const loginRes = await request(app).post("/auth/login").send({
      email: config.admin.email,
      password: config.admin.password,
    });
    adminToken = loginRes.body.data.token;
  });

  const sampleEmployee = {
    name: "Robert Martin",
    email: "robert@company.com",
    department: "Engineering",
    role: "Software Architect",
  };

  it("POST /employees - should create a new employee when authenticated as ADMIN", async () => {
    const res = await request(app)
      .post("/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sampleEmployee)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe("Robert Martin");
  });

  it("GET /employees - should fetch all employees", async () => {
    await request(app)
      .post("/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sampleEmployee);

    const res = await request(app)
      .get("/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("GET /employees/:id - should fetch a specific employee by ID", async () => {
    const createRes = await request(app)
      .post("/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sampleEmployee);

    const empId = createRes.body.data.id;

    const res = await request(app)
      .get(`/employees/${empId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(empId);
    expect(res.body.data.email).toBe("robert@company.com");
  });

  it("GET /employees/:id - should return 404 Not Found for non-existent employee ID", async () => {
    const res = await request(app)
      .get("/employees/9999")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Employee not found");
  });

  it("GET /employees/:id - should return 400 Bad Request for invalid non-numeric ID", async () => {
    const res = await request(app)
      .get("/employees/invalid-id")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it("PUT /employees/:id - should update employee details", async () => {
    const createRes = await request(app)
      .post("/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sampleEmployee);

    const empId = createRes.body.data.id;

    const res = await request(app)
      .put(`/employees/${empId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "Principal Architect" })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe("Principal Architect");
  });

  it("DELETE /employees/:id - should delete an employee by ID", async () => {
    const createRes = await request(app)
      .post("/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sampleEmployee);

    const empId = createRes.body.data.id;

    const deleteRes = await request(app)
      .delete(`/employees/${empId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(deleteRes.body.success).toBe(true);

    // Verify subsequent GET returns 404
    await request(app)
      .get(`/employees/${empId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);
  });

  it("GET /employees/search - should filter employees with pagination", async () => {
    await request(app)
      .post("/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sampleEmployee);

    const res = await request(app)
      .get("/employees/search?name=robert&department=Engineering&page=1&limit=10")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.total).toBe(1);
  });
});
