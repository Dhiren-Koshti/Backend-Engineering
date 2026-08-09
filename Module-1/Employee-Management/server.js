const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const employeeRoutes = require("./routes/employeeRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middlewares/errorHandler");
const { seedAdminUser } = require("./services/userService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is working!");
});

app.use("/employees", employeeRoutes);
app.use("/auth", userRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

// Seed initial Admin user then start server
seedAdminUser().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
