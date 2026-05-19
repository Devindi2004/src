const env = require("../config/env");

const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong.";
  let details = err.details || null;

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
    details = err.keyValue;
  }

  if (err.name === "ValidationError") {
    statusCode = 422;
    message = "Validation failed.";
    details = Object.values(err.errors).map((item) => item.message);
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired authentication token.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    details,
    stack: env.nodeEnv === "production" ? undefined : err.stack,
  });
};

module.exports = { errorHandler, notFound };
