import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

const startServer = async (): Promise<void> => {
  try {
    // Start HTTP server immediately so Railway health checks pass instantly
    app.listen(PORT, HOST, () => {
      console.log(`QuizMind API server running on ${HOST}:${PORT}`);
    });

    // Connect to MongoDB Atlas
    await connectDatabase();
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

startServer();