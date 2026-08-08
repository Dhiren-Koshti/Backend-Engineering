const express = require("express");
const employeeRoutes = require("./routes/employeeRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is working!");
});

app.use("/employees", employeeRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
