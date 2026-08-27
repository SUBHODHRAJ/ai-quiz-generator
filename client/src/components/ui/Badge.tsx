import type { Quiz, QuestionType, Difficulty } from '../../types/quiz';

interface QuizStatusBadgeProps {
  status: Quiz['status'];
}

export function QuizStatusBadge({ status }: QuizStatusBadgeProps) {
  const map: Record<NonNullable<Quiz['status']>, { label: string; cls: string }> = {
    draft:     { label: 'Draft',     cls: 'badge badge-draft' },
    verified:  { label: 'Verified',  cls: 'badge badge-verified' },
    published: { label: 'Published', cls: 'badge badge-published' },
  };
  const s = map[status ?? 'draft'];
  return <span className={s.cls}>{s.label}</span>;
}

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const map: Record<Difficulty, { label: string; cls: string }> = {
    easy:   { label: 'Easy',   cls: 'badge badge-easy' },
    medium: { label: 'Medium', cls: 'badge badge-medium' },
    hard:   { label: 'Hard',   cls: 'badge badge-hard' },
  };
  const d = map[difficulty];
  return <span className={d.cls}>{d.label}</span>;
}

interface QuestionTypeBadgeProps {
  type: QuestionType;
}

export function QuestionTypeBadge({ type }: QuestionTypeBadgeProps) {
  const map: Record<QuestionType, { label: string; cls: string }> = {
    mcq:          { label: 'MCQ',          cls: 'badge badge-mcq' },
    true_false:   { label: 'True / False', cls: 'badge badge-true-false' },
    short_answer: { label: 'Short Answer', cls: 'badge badge-short' },
  };
  const t = map[type];
  return <span className={t.cls}>{t.label}</span>;
}
