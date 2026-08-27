import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  question: string;
  type: "mcq" | "true_false" | "short_answer";
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  source?: string;
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  topic: string;
  sourceFile?: string;
  questions: IQuestion[];
  status: "draft" | "verified" | "published";
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true
    },

    type: {
      type: String,
      enum: ["mcq", "true_false", "short_answer"],
      default: "mcq",
      required: true
    },

    options: {
      type: [String],
      default: undefined
    },

    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
      default: "Answer"
    },

    explanation: {
      type: String,
      default: "Derived from source documentation.",
      trim: true
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },

    source: {
      type: String,
      default: "Source: Uploaded training material"
    }
  },
  { _id: false }
);

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    topic: {
      type: String,
      default: ""
    },

    sourceFile: String,

    questions: {
      type: [questionSchema],
      required: true
    },

    status: {
      type: String,
      enum: ["draft", "verified", "published"],
      default: "draft"
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

export const Quiz = mongoose.model<IQuiz>("Quiz", quizSchema);
