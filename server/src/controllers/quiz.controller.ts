import { Response } from "express";
import fs from "fs/promises";
import mongoose from "mongoose";

import { extractTextFromFile } from "../services/document.service";
import { generateQuiz } from "../services/ai/quiz.service";
import { Quiz } from "../models/Quiz";
import { AuthenticatedRequest } from "../types/auth";

export async function generateQuizFromDocument(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  let filePath: string | undefined;

  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required."
      });
      return;
    }

    if (req.user.role !== "TEACHER") {
      res.status(403).json({
        success: false,
        message: "Only teachers can generate quizzes."
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please upload a PDF, DOCX, TXT or MD file."
      });
      return;
    }

    filePath = req.file.path;

    const questionCount = Math.min(
      Math.max(Number(req.body.questionCount) || 10, 1),
      50
    );

    const difficulty =
      ["easy", "medium", "hard"].includes(req.body.difficulty)
        ? req.body.difficulty
        : "medium";

    const questionTypes = req.body.questionTypes
      ? String(req.body.questionTypes)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      : ["mcq", "true_false", "short_answer"];

    const text = await extractTextFromFile(
      req.file.path,
      req.file.originalname
    );

    if (!text.trim()) {
      res.status(400).json({
        success: false,
        message: "Could not extract text from the uploaded document."
      });
      return;
    }

    const MAX_CHARS = 50000;
    const studyMaterial = text.slice(0, MAX_CHARS);

    const generated = await generateQuiz(
      studyMaterial,
      questionCount,
      difficulty,
      questionTypes
    );

    const quiz = await Quiz.create({
      title: generated.title || "AI Generated Quiz",
      description: generated.description || "",
      topic: generated.topic || "General",
      sourceFile: req.file.originalname,
      questions: generated.questions,
      status: "draft",
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: "Quiz generated successfully.",
      data: quiz
    });
  } catch (error: any) {
    console.error(
      "Quiz generation error:",
      error?.response?.data || error
    );

    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to generate quiz. Please try again."
    });
  } finally {
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

export async function getTeacherQuizzes(
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

    const quizzes = await Quiz.find({
      createdBy: req.user.userId
    }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      data: quizzes
    });
  } catch (error: any) {
    console.error("Get teacher quizzes error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes."
    });
  }
}

export async function getPublishedQuizzes(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const quizzes = await Quiz.find({
      status: "published"
    })
      .sort({ createdAt: -1 })
      .select("title description topic sourceFile status createdAt updatedAt questions");

    // Sanitize questions to avoid sending answers to students in the quiz list
    const sanitized = quizzes.map((q) => {
      const plain = q.toObject();
      return {
        _id: plain._id,
        title: plain.title,
        description: plain.description,
        topic: plain.topic,
        sourceFile: plain.sourceFile,
        status: plain.status,
        questionCount: plain.questions?.length || 0,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
        difficulty: plain.questions?.[0]?.difficulty || "medium"
      };
    });

    res.status(200).json({
      success: true,
      data: sanitized
    });
  } catch (error: any) {
    console.error("Get published quizzes error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch published quizzes."
    });
  }
}

export async function getTeacherStats(
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
    const quizzes = await Quiz.find({ createdBy: userId });

    const totalQuizzes = quizzes.length;
    let draftQuizzes = 0;
    let verifiedQuizzes = 0;
    let publishedQuizzes = 0;
    let totalQuestions = 0;

    for (const q of quizzes) {
      if (q.status === "draft") draftQuizzes++;
      else if (q.status === "verified") verifiedQuizzes++;
      else if (q.status === "published") publishedQuizzes++;
      totalQuestions += q.questions?.length || 0;
    }

    res.status(200).json({
      success: true,
      data: {
        totalQuizzes,
        draftQuizzes,
        verifiedQuizzes,
        publishedQuizzes,
        totalQuestions,
        recentQuizzes: quizzes.slice(0, 5)
      }
    });
  } catch (error: any) {
    console.error("Get teacher stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate teacher stats."
    });
  }
}

export async function getQuizById(
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
        message: "Invalid quiz ID format."
      });
      return;
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: "Quiz not found."
      });
      return;
    }

    const isOwner =
      quiz.createdBy && quiz.createdBy.toString() === req.user.userId;

    if (isOwner || req.user.role === "TEACHER") {
      // Teacher owner gets full quiz
      if (!isOwner && quiz.status !== "published") {
        res.status(403).json({
          success: false,
          message: "You do not have permission to view this quiz."
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: quiz
      });
      return;
    }

    // Student role: can only take published quizzes; sanitize out correct answer and explanation!
    if (quiz.status !== "published") {
      res.status(404).json({
        success: false,
        message: "This quiz is not available."
      });
      return;
    }

    const sanitizedQuestions = quiz.questions.map((q) => ({
      question: q.question,
      type: q.type,
      options: q.options,
      difficulty: q.difficulty,
      source: q.source
    }));

    res.status(200).json({
      success: true,
      data: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        topic: quiz.topic,
        sourceFile: quiz.sourceFile,
        status: quiz.status,
        questions: sanitizedQuestions,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      }
    });
  } catch (error: any) {
    console.error("Get quiz error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz."
    });
  }
}

export async function updateQuiz(
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

    const allowedFields = [
      "title",
      "description",
      "topic",
      "questions",
      "status"
    ];

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const quiz = await Quiz.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.userId
      },
      {
        $set: updates
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: "Quiz not found or you do not have permission to modify it."
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully.",
      data: quiz
    });
  } catch (error: any) {
    console.error("Update quiz error:", error);

    res.status(400).json({
      success: false,
      message: error?.message || "Failed to update quiz."
    });
  }
}

export async function updateQuizStatus(
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

    const { status } = req.body;

    if (
      !["draft", "verified", "published"].includes(status)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid quiz status."
      });
      return;
    }

    const quiz = await Quiz.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.userId
      },
      {
        $set: { status }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: "Quiz not found or you do not have permission to modify it."
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Quiz status updated to ${status}.`,
      data: quiz
    });
  } catch (error: any) {
    console.error("Update quiz status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update quiz status."
    });
  }
}

export async function publishQuiz(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  req.body.status = "published";
  return updateQuizStatus(req, res);
}

export async function unpublishQuiz(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  req.body.status = "draft";
  return updateQuizStatus(req, res);
}

export async function deleteQuiz(
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

    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: "Quiz not found or you do not have permission to delete it."
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully."
    });
  } catch (error: any) {
    console.error("Delete quiz error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete quiz."
    });
  }
}
