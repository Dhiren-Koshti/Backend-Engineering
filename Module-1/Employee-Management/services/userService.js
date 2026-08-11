const AppError = require("../utils/AppError");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const { generateToken } = require("../utils/jwtUtils");
const config = require("../config/config");
const logger = require("../utils/logger");

// In-memory data store for users
const usersMap = new Map(); // id -> user object
const userEmailMap = new Map(); // email.toLowerCase() -> id
let nextUserId = 1;

/**
 * Seeds initial Admin user at server startup if it doesn't exist yet.
 */
const seedAdminUser = async () => {
  const adminEmail = config.admin.email.trim().toLowerCase();
  const adminName = config.admin.name;
  const adminPassword = config.admin.password;

  if (!userEmailMap.has(adminEmail)) {
    const hashedPassword = await hashPassword(adminPassword);
    const id = nextUserId++;

    const adminUser = {
      id,
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    };

    usersMap.set(id, adminUser);
    userEmailMap.set(adminEmail, id);

    logger.info(`[SEED] Admin user seeded successfully (${adminEmail})`);
  }
};

/**
 * Resets user in-memory storage and re-seeds Super Admin for automated testing.
 */
const resetUserServiceState = async () => {
  usersMap.clear();
  userEmailMap.clear();
  nextUserId = 1;
  await seedAdminUser();
};

/**
 * Service for user registration.
 * Checks duplicate email, hashes password, assigns default role "USER", auto-increments ID.
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} Created user object (without password)
 */
const registerUserService = async (userData) => {
  const { name, email, password } = userData;
  const normalizedEmail = email.trim().toLowerCase();

  // O(1) duplicate email check
  if (userEmailMap.has(normalizedEmail)) {
    throw new AppError("User with this email already exists", 400);
  }

  // Hash password using helper utility
  const hashedPassword = await hashPassword(password.trim());

  const id = nextUserId++;
  const newUser = {
    id,
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "USER",
  };

  // Store in memory
  usersMap.set(id, newUser);
  userEmailMap.set(normalizedEmail, id);

  // Exclude password from the returned object for security
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Service for user login.
 * Verifies email and password, generates JWT token.
 * @param {Object} loginData - { email, password }
 * @returns {Promise<Object>} { user, token }
 */
const loginUserService = async (loginData) => {
  const { email, password } = loginData;
  const normalizedEmail = email.trim().toLowerCase();

  // O(1) user ID lookup from email index
  const userId = userEmailMap.get(normalizedEmail);

  if (!userId) {
    throw new AppError("Invalid email or password", 401);
  }

  const user = usersMap.get(userId);

  // Compare entered password with stored hashed password
  const isPasswordMatch = await comparePassword(password.trim(), user.password);

  if (!isPasswordMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate JWT token
  const token = generateToken({ id: user.id, role: user.role });

  // Exclude password from the returned user object
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

module.exports = {
  usersMap,
  userEmailMap,
  seedAdminUser,
  resetUserServiceState,
  registerUserService,
  loginUserService,
};
