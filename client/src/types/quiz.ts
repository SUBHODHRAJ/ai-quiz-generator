export type QuestionType =
  | 'mcq'
  | 'true_false'
  | 'short_answer';

export type Difficulty =
  | 'easy'
  | 'medium'
  | 'hard';

export interface Question {
  _id?: string;
  question: string;
  type: QuestionType;
  options?: string[];
  answer?: string;
  explanation?: string;
  difficulty: Difficulty;
  source?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  topic: string;
  sourceFile?: string;
  questions: Question[];
  status?: 'draft' | 'verified' | 'published';
  questionCount?: number;
  difficulty?: Difficulty;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttemptAnswer {
  questionIndex: number;
  question: string;
  questionType: QuestionType;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  _id: string;
  student: string;
  quiz: string | Quiz;
  quizTitle: string;
  quizTopic: string;
  answers: AttemptAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers?: number;
  percentage: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentStats {
  availableQuizzes: number;
  quizzesCompleted: number;
  averageScore: number;
  learningStreak: number;
  recentAttempts: Array<{
    _id: string;
    quizTitle: string;
    quizTopic: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: string;
  }>;
}

export interface TeacherStats {
  totalQuizzes: number;
  draftQuizzes: number;
  verifiedQuizzes: number;
  publishedQuizzes: number;
  totalQuestions: number;
  recentQuizzes: Quiz[];
}
