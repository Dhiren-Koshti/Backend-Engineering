const { generateToken, verifyToken } = require("../../utils/jwtUtils");

describe("JWT Utilities Unit Tests", () => {
  it("should generate a valid JWT token string", () => {
    const payload = { id: 1, role: "ADMIN" };
    const token = generateToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });

  it("should verify token and return decoded payload", () => {
    const payload = { id: 42, role: "USER" };
    const token = generateToken(payload);

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe("USER");
  });

  it("should throw error when verifying invalid or tampered token", () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature";

    expect(() => verifyToken(invalidToken)).toThrow();
  });
});
