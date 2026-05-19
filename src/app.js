const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const apiRoutes = require("./routes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== "test") {
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
}

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "DineFlow API",
    version: "v1",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/health", (_req, res) => {
  res.json({
    success: true,
    service: "DineFlow API",
    version: "v1",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
