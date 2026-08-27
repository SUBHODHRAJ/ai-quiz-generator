import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.get("/health", (_req, res) => {
      res.status(200).json({
        success: true,
        message: "QuizMind API is running",
      });
    });

    app.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();