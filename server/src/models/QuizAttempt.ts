import mongoose, { Schema, Document } from "mongoose";

export interface IAttemptAnswer {
  questionIndex: number;
  question: string;
  questionType: "mcq" | "true_false" | "short_answer";
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

export interface IQuizAttempt extends Document {
  student: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  quizTitle: string;
  quizTopic: string;
  answers: IAttemptAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const attemptAnswerSchema = new Schema<IAttemptAnswer>(
  {
    questionIndex: { type: Number, required: true },
    question: { type: String, required: true },
    questionType: {
      type: String,
      enum: ["mcq", "true_false", "short_answer"],
      required: true
    },
    selectedAnswer: { type: String, default: "" },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: "" },
    isCorrect: { type: Boolean, required: true }
  },
  { _id: false }
);

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true
    },
    quizTitle: {
      type: String,
      default: "Quiz"
    },
    quizTopic: {
      type: String,
      default: ""
    },
    answers: {
      type: [attemptAnswerSchema],
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const QuizAttempt = mongoose.model<IQuizAttempt>(
  "QuizAttempt",
  quizAttemptSchema
);
