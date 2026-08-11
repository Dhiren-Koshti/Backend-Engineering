const {
  registerUserService,
  loginUserService,
  seedAdminUser,
} = require("../../services/userService");
const AppError = require("../../utils/AppError");
const config = require("../../config/config");

describe("User Service Unit Tests", () => {
  it("should register a new user successfully and exclude password", async () => {
    const userData = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password@123",
    };

    const result = await registerUserService(userData);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("john@example.com");
    expect(result.role).toBe("USER");
    expect(result.password).toBeUndefined();
  });

  it("should throw AppError 400 when registering duplicate email", async () => {
    const userData = {
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Password@123",
    };

    await registerUserService(userData);

    await expect(registerUserService(userData)).rejects.toThrow(AppError);
    await expect(registerUserService(userData)).rejects.toHaveProperty(
      "statusCode",
      400
    );
  });

  it("should authenticate valid user login credentials and return token", async () => {
    const loginData = {
      email: config.admin.email,
      password: config.admin.password,
    };

    const result = await loginUserService(loginData);

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(config.admin.email.toLowerCase());
    expect(result.user.role).toBe("ADMIN");
    expect(result.token).toBeDefined();
    expect(result.user.password).toBeUndefined();
  });

  it("should throw AppError 401 on incorrect password", async () => {
    const loginData = {
      email: config.admin.email,
      password: "WrongPassword@999",
    };

    await expect(loginUserService(loginData)).rejects.toThrow(AppError);
    await expect(loginUserService(loginData)).rejects.toHaveProperty(
      "statusCode",
      401
    );
  });

  it("should throw AppError 401 when logging in non-existent user email", async () => {
    const loginData = {
      email: "nonexistent@example.com",
      password: "Password@123",
    };

    await expect(loginUserService(loginData)).rejects.toThrow(AppError);
    await expect(loginUserService(loginData)).rejects.toHaveProperty(
      "statusCode",
      401
    );
  });
});
