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

const clientUrl =
  process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: clientUrl,
    credentials: true
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api", apiLimiter);

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Quiz Generator API is running.",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/attempts", attemptRoutes);

app.use(errorHandler);

export default app;
