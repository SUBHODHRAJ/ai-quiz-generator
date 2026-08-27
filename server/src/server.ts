import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";
const NODE_ENV = process.env.NODE_ENV || "development";

const startServer = async (): Promise<void> => {
  try {
    const server = app.listen(PORT, HOST, () => {
      console.log("==========================================");
      console.log(` QuizMind API Server Initialized `);
      console.log("==========================================");
      console.log(` Environment : ${NODE_ENV}`);
      console.log(` Host        : ${HOST}`);
      console.log(` Port        : ${PORT}`);
      console.log(` Health URI  : http://${HOST}:${PORT}/health`);
      console.log(` API Base    : http://${HOST}:${PORT}/api`);
      console.log("==========================================");
    });

    // Connect to MongoDB Atlas
    await connectDatabase();

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      console.log(`Received ${signal}. Gracefully shutting down HTTP server...`);
      server.close(() => {
        console.log("QuizMind HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("CRITICAL: Server startup failure:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

startServer();