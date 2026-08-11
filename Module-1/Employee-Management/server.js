const express = require("express");
const config = require("./config/config");
const logger = require("./utils/logger");
const requestLogger = require("./middlewares/requestLogger");
const employeeRoutes = require("./routes/employeeRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middlewares/errorHandler");
const { seedAdminUser } = require("./services/userService");

const app = express();
const PORT = config.port;

// Global Middleware
app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("Server is working!");
});

// Test-only route to verify 500 Error Boundary
if (process.env.NODE_ENV === "test") {
  app.get("/test-error", (req, res, next) => {
    next(new Error("Simulated unhandled server exception for testing"));
  });
}

app.use("/employees", employeeRoutes);
app.use("/auth", userRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

// Only listen on PORT if server.js is executed directly (not when required in Supertest)
if (require.main === module) {
  logger.info("Initializing server startup...");
  seedAdminUser().then(() => {
    app.listen(PORT, () => {
      logger.info(`Server successfully started on port ${PORT}`);
    });
  });
}

module.exports = app;
