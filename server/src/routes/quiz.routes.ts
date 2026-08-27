import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  generateQuizFromDocument,
  getTeacherQuizzes,
  getPublishedQuizzes,
  getTeacherStats,
  getQuizById,
  updateQuiz,
  updateQuizStatus,
  publishQuiz,
  unpublishQuiz,
  deleteQuiz
} from "../controllers/quiz.controller";
import { submitQuizAttempt } from "../controllers/attemptController";
import { authenticate } from "../middleware/auth";

const router = Router();

const uploadDirectory = path.join(
  process.cwd(),
  "uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const allowedExtensions = [
  ".pdf",
  ".docx",
  ".txt",
  ".md"
];

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024
  },

  fileFilter: (_req, file, cb) => {
    const extension =
      path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error(
          "Only PDF, DOCX, TXT and MD files are supported."
        )
      );
    }

    cb(null, true);
  }
});

/*
 * Get all published quizzes for students
 */
router.get(
  "/published",
  authenticate,
  getPublishedQuizzes
);

/*
 * Get teacher dashboard stats
 */
router.get(
  "/stats",
  authenticate,
  getTeacherStats
);

/*
 * Get all quizzes belonging to the
 * currently authenticated teacher.
 */
router.get(
  "/",
  authenticate,
  getTeacherQuizzes
);

/*
 * Generate a quiz from an uploaded document.
 */
router.post(
  "/generate",
  authenticate,
  upload.single("document"),
  generateQuizFromDocument
);

/*
 * Get one quiz (complete for teacher owner, sanitized for student)
 */
router.get(
  "/:id",
  authenticate,
  getQuizById
);

/*
 * Update quiz content.
 */
router.put(
  "/:id",
  authenticate,
  updateQuiz
);

/*
 * Change quiz status:
 * draft / verified / published
 */
router.patch(
  "/:id/status",
  authenticate,
  updateQuizStatus
);

/*
 * Publish quiz
 */
router.patch(
  "/:id/publish",
  authenticate,
  publishQuiz
);

/*
 * Unpublish quiz
 */
router.patch(
  "/:id/unpublish",
  authenticate,
  unpublishQuiz
);

/*
 * Submit quiz attempt
 */
router.post(
  "/:id/attempts",
  authenticate,
  submitQuizAttempt
);

router.post(
  "/:id/attempt",
  authenticate,
  submitQuizAttempt
);

/*
 * Delete a teacher's own quiz.
 */
router.delete(
  "/:id",
  authenticate,
  deleteQuiz
);

export default router;
