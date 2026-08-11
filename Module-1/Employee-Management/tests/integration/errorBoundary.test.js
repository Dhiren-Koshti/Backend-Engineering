const request = require("supertest");
const app = require("../../server");

describe("Global Error Boundary Integration Test (GET /test-error)", () => {
  it("should catch unexpected errors and return safe 500 response without leaking stack traces or internal details", async () => {
    const res = await request(app).get("/test-error").expect(500);

    // Verify sanitized error output format
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(res.body.error.message).toBe("Internal server error");

    // Verify NO internal details or stack traces are leaked to client
    expect(res.body.stack).toBeUndefined();
    expect(res.body.error.stack).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("Simulated unhandled server exception");
    expect(JSON.stringify(res.body)).not.toContain("Employee-Management");
  });
});
