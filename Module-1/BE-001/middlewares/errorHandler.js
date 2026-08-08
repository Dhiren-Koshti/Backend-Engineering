const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    status,
    statusCode,
    message,
  });
};

module.exports = errorHandler;
