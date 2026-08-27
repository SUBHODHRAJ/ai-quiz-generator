import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import path from "path";

import authRoutes from "./routes/authRoutes";
import quizRoutes from "./routes/quiz.routes";
import attemptRoutes from "./routes/attemptRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

// Allowed origins for CORS (supports local development & Railway production)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      const normalizedOrigin = origin.replace(/\/$/, "");
      const isAllowed =
        allowedOrigins.some(
          (allowed) => allowed.replace(/\/$/, "") === normalizedOrigin
        ) ||
        origin.endsWith(".up.railway.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1");

      if (isAllowed) {
        return callback(null, true);
      }
      
      // Allow dynamic origin while enabling credentials
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api", apiLimiter);

// Health check endpoints (supports both /health and /api/health)
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "QuizMind API is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "QuizMind API is running",
    timestamp: new Date().toISOString()
  });
});

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/attempts", attemptRoutes);

app.use(errorHandler);

export default app;
