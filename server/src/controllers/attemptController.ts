import { Response } from "express";
import mongoose from "mongoose";
import { Quiz } from "../models/Quiz";
import { QuizAttempt } from "../models/QuizAttempt";
import { AuthenticatedRequest } from "../types/auth";

/**
 * Normalize text for scoring short answer questions:
 * Lowercases, strips punctuation, and collapses extra whitespace.
 */
function normalizeAnswer(str: string): string {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Evaluate if a submitted answer matches the expected correct answer.
 */
function evaluateAnswer(
  type: string,
  submitted: string,
  expected: string
): boolean {
  const s = normalizeAnswer(submitted);
  const e = normalizeAnswer(expected);

  if (!s || !e) return false;

  if (type === "mcq" || type === "true_false") {
    return s === e;
  }

  // Short answer: exact normalized match, or expected contained in submitted / submitted contained in expected if substantial
  if (s === e) return true;

  // If numbers match exactly
  const sNum = parseFloat(s);
  const eNum = parseFloat(e);
  if (!isNaN(sNum) && !isNaN(eNum) && sNum === eNum) return true;

  return false;
}

/**
 * Submit an attempt for a quiz
 * POST /api/quizzes/:id/attempts or POST /api/attempts/:quizId
 */
export async function submitQuizAttempt(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required."
      });
      return;
    }

    const quizId = String(req.params.id || req.params.quizId || "");
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      res.status(400).json({
        success: false,
        message: "Invalid quiz ID."
      });
      return;
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({
        success: false,
        message: "Quiz not found."
      });
      return;
    }

    if (quiz.status !== "published" && req.user.role !== "TEACHER") {
      res.status(403).json({
        success: false,
        message: "This quiz is not currently available."
      });
      return;
    }

    // req.body.answers can be array of { questionIndex, answer } or key-value map { [index]: answer }
    const userAnswersInput = req.body.answers || [];

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    const evaluatedAnswers = quiz.questions.map((q, idx) => {
      let submitted = "";

      if (Array.isArray(userAnswersInput)) {
        const found = userAnswersInput.find(
          (a: any) => a.questionIndex === idx || a.questionId === idx
        );
        submitted = found ? String(found.answer || found.selectedAnswer || "") : "";
      } else if (typeof userAnswersInput === "object" && userAnswersInput !== null) {
        submitted = String(userAnswersInput[idx] || userAnswersInput[String(idx)] || "");
      }

      const isCorrect = evaluateAnswer(q.type, submitted, q.answer);
      if (isCorrect) correctCount++;

      return {
        questionIndex: idx,
        question: q.question,
        questionType: q.type,
        selectedAnswer: submitted,
        correctAnswer: q.answer,
        explanation: q.explanation,
        isCorrect
      };
    });

    const percentage = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

    const attempt = await QuizAttempt.create({
      student: req.user.userId,
      quiz: quiz._id,
      quizTitle: quiz.title,
      quizTopic: quiz.topic || "",
      answers: evaluatedAnswers,
      score: correctCount,
      totalQuestions,
      correctAnswers: correctCount,
      percentage,
      submittedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully.",
      data: {
        attemptId: attempt._id,
        score: correctCount,
        totalQuestions,
        correctAnswers: correctCount,
        incorrectAnswers: totalQuestions - correctCount,
        percentage,
        quizTitle: quiz.title,
        quizTopic: quiz.topic,
        submittedAt: attempt.submittedAt,
        answers: evaluatedAnswers
      }
    });
  } catch (error: any) {
    console.error("Submit quiz attempt error:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to submit quiz attempt."
    });
  }
}

/**
 * Get all attempts for the authenticated student
 * GET /api/attempts/my
 */
export async function getMyAttempts(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required."
      });
      return;
    }

    const attempts = await QuizAttempt.find({
      student: req.user.userId
    })
      .sort({ createdAt: -1 })
      .populate("quiz", "title topic difficulty");

    res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (error: any) {
    console.error("Get my attempts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attempt history."
    });
  }
}

/**
 * Get a specific attempt by ID
 * GET /api/attempts/:id
 */
export async function getAttemptById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required."
      });
      return;
    }

    const id = String(req.params.id || "");
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid attempt ID format."
      });
      return;
    }

    const attempt = await QuizAttempt.findById(id).populate(
      "quiz",
      "title topic"
    );

    if (!attempt) {
      res.status(404).json({
        success: false,
        message: "Attempt not found."
      });
      return;
    }

    // Ensure student only accesses their own attempt, unless teacher
    if (
      attempt.student.toString() !== req.user.userId &&
      req.user.role !== "TEACHER"
    ) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to view this attempt."
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error: any) {
    console.error("Get attempt by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attempt."
    });
  }
}

/**
 * Get student dashboard statistics
 * GET /api/attempts/stats or GET /api/student/stats
 */
export async function getStudentStats(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required."
      });
      return;
    }

    const userId = req.user.userId;

    // Count published quizzes
    const availableQuizzes = await Quiz.countDocuments({
      status: "published"
    });

    // Get student attempts
    const attempts = await QuizAttempt.find({ student: userId })
      .sort({ createdAt: -1 })
      .select("percentage createdAt submittedAt score totalQuestions quizTitle quizTopic");

    const quizzesCompleted = attempts.length;

    let averageScore = 0;
    if (quizzesCompleted > 0) {
      const sum = attempts.reduce((acc, curr) => acc + curr.percentage, 0);
      averageScore = Math.round(sum / quizzesCompleted);
    }

    // Calculate learning streak in days
    let streak = 0;
    if (attempts.length > 0) {
      const uniqueDates = Array.from(
        new Set(
          attempts.map(a =>
            new Date(a.submittedAt || a.createdAt).toISOString().split("T")[0]
          )
        )
      ).sort().reverse();

      const todayStr = new Date().toISOString().split("T")[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      // Streak counts if the latest attempt was today or yesterday
      if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
        let currentDate = new Date(uniqueDates[0]);
        streak = 1;

        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i]);
          const diffDays = Math.round(
            (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            streak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        availableQuizzes,
        quizzesCompleted,
        averageScore,
        learningStreak: streak,
        recentAttempts: attempts.slice(0, 5)
      }
    });
  } catch (error: any) {
    console.error("Get student stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate student statistics."
    });
  }
}
