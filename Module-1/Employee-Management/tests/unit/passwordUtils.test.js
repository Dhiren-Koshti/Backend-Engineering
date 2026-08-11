const { hashPassword, comparePassword } = require("../../utils/passwordUtils");

describe("Password Utilities Unit Tests", () => {
  it("should hash a plain text password", async () => {
    const rawPassword = "SecretPassword@123";
    const hashed = await hashPassword(rawPassword);

    expect(hashed).toBeDefined();
    expect(hashed).not.toEqual(rawPassword);
    expect(typeof hashed).toBe("string");
  });

  it("should return true for matching password comparison", async () => {
    const rawPassword = "SecretPassword@123";
    const hashed = await hashPassword(rawPassword);

    const isMatch = await comparePassword(rawPassword, hashed);
    expect(isMatch).toBe(true);
  });

  it("should return false for incorrect password comparison", async () => {
    const rawPassword = "SecretPassword@123";
    const hashed = await hashPassword(rawPassword);

    const isMatch = await comparePassword("WrongPassword@999", hashed);
    expect(isMatch).toBe(false);
  });
});
