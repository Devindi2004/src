const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");
const { initSocket } = require("./sockets");

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
  });

  initSocket(io);

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${env.port} is already in use. Stop the existing process or set PORT.`);
      process.exit(1);
    }

    console.error("HTTP server error:", error);
    process.exit(1);
  });

  server.listen(env.port, () => {
    console.log("========================================");
    console.log("DineFlow API started");
    console.log(`Environment: ${env.nodeEnv}`);
    console.log(`REST API: http://localhost:${env.port}/api/v1`);
    console.log(`Health: http://localhost:${env.port}/health`);
    console.log(`Socket.IO: ws://localhost:${env.port}`);
    console.log("========================================");
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Closing DineFlow API...`);
    server.close(async () => {
      await mongoose.connection.close(false);
      console.log("HTTP server and MongoDB connection closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer().catch((error) => {
  console.error("Failed to start DineFlow API:", error);
  process.exit(1);
});
