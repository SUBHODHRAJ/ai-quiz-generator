import { Router } from "express";
import {
  getAttemptById,
  getMyAttempts,
  getStudentStats,
  submitQuizAttempt
} from "../controllers/attemptController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/:quizId", authenticate, submitQuizAttempt);
router.post("/:id/submit", authenticate, submitQuizAttempt);
router.get("/my", authenticate, getMyAttempts);
router.get("/stats", authenticate, getStudentStats);
router.get("/:id", authenticate, getAttemptById);

export default router;
