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

app.use("/employees", employeeRoutes);
app.use("/auth", userRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

// Log server startup sequence
logger.info("Initializing server startup...");
seedAdminUser().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server successfully started on port ${PORT}`);
  });
});
