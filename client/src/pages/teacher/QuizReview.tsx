import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  Info,
  MapPin,
  Sparkles,
  Save,
  Globe,
  ArrowLeft,
} from 'lucide-react';
import type { Quiz, Question } from '../../types/quiz';
import { QuizStatusBadge, DifficultyBadge, QuestionTypeBadge } from '../../components/ui/Badge';
import { AlertBox } from '../../components/ui/ConfirmDialog';
import api from '../../services/api';

function QuestionItem({ question, index }: { question: Question; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="question-number">{index + 1}</div>
        <div className="question-meta" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-2)' }}>
            <QuestionTypeBadge type={question.type} />
            <DifficultyBadge difficulty={question.difficulty} />
          </div>
          <p className="question-text">{question.question}</p>
        </div>
      </div>

      {/* MCQ Options */}
      {question.type === 'mcq' && question.options && (
        <div className="question-options">
          {question.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isCorrect = opt === question.answer;
            return (
              <div
                key={i}
                className={`option-item ${isCorrect ? 'correct' : ''}`}
              >
                <span className="option-letter">{letter}.</span>
                <span style={{ flex: 1 }}>{opt}</span>
                {isCorrect && <CheckCircle2 size={15} style={{ color: 'var(--color-success)' }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* True/False */}
      {question.type === 'true_false' && (
        <div className="question-options">
          {['True', 'False'].map(opt => {
            const isCorrect = opt.toLowerCase() === question.answer?.toLowerCase();
            return (
              <div key={opt} className={`option-item ${isCorrect ? 'correct' : ''}`}>
                <span className="option-letter">{opt === 'True' ? 'T' : 'F'}.</span>
                <span style={{ flex: 1 }}>{opt}</span>
                {isCorrect && <CheckCircle2 size={15} style={{ color: 'var(--color-success)' }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Short answer preview (collapsed) */}
      {question.type === 'short_answer' && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setExpanded(p => !p)}
          style={{ marginBottom: expanded ? 'var(--sp-3)' : 0 }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide answer' : 'View expected answer'}
        </button>
      )}

      {/* Answer + Explanation (expandable for MCQ/TF) */}
      {(question.type !== 'short_answer' || expanded) && (
        <div className="answer-section" style={{ marginTop: question.type === 'short_answer' && !expanded ? 0 : undefined }}>
          {question.type === 'short_answer' && (
            <>
              <div className="answer-section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={12} /> Expected Answer
              </div>
              <div className="answer-value">{question.answer}</div>
            </>
          )}

          {question.explanation && (
            <>
              <div className="answer-section-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: question.type === 'short_answer' ? 'var(--sp-3)' : 0 }}>
                <Info size={12} /> Explanation
              </div>
              <div className="explanation-text">{question.explanation}</div>
            </>
          )}

          {question.source && (
            <div className="source-text" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 'var(--sp-2)' }}>
              <MapPin size={11} /> {question.source}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuizReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const quiz: Quiz | undefined = (location.state as { quiz?: Quiz })?.quiz;

  const [saving, setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveError, setSaveError]   = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  if (!quiz) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--sp-16)' }}>
        <FileText size={48} style={{ color: 'var(--color-text-subtle)', margin: '0 auto var(--sp-4)' }} />
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--sp-6)' }}>
          No quiz data found. Generate a quiz first.
        </p>
        <Link to="/teacher/upload" className="btn btn-primary">
          <Sparkles size={16} /> Create a quiz
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    if (!quiz._id) { setSaveSuccess('Quiz already saved!'); return; }
    setSaving(true);
    setSaveError('');
    try {
      await api.put(`/quizzes/${quiz._id}`, quiz);
      setSaveSuccess('Quiz saved successfully!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setSaveError(axiosErr?.response?.data?.message || 'Failed to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!quiz._id) { setSaveError('Save the quiz before publishing.'); return; }
    setPublishing(true);
    setSaveError('');
    try {
      await api.patch(`/quizzes/${quiz._id}/status`, { status: 'published' });
      setSaveSuccess('Quiz published!');
      navigate('/teacher/quizzes');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setSaveError(axiosErr?.response?.data?.message || 'Failed to publish quiz.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      {/* Back */}
      <Link to="/teacher/upload" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--sp-6)', display: 'inline-flex' }}>
        <ArrowLeft size={14} /> Back to generator
      </Link>

      {/* Quiz Header */}
      <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)', flexWrap: 'wrap' }}>
              <QuizStatusBadge status={quiz.status ?? 'draft'} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {quiz.questions.length} questions
              </span>
              {quiz.topic && (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  · {quiz.topic}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 'var(--sp-2)' }}>
              {quiz.title}
            </h1>

            {quiz.description && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {quiz.description}
              </p>
            )}

            {quiz.sourceFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'var(--sp-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>
                <FileText size={12} /> Source: {quiz.sourceFile}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', minWidth: 160 }}>
            {saveError && <AlertBox type="error" message={saveError} />}
            {saveSuccess && <AlertBox type="success" message={saveSuccess} />}

            <button
              id="save-quiz-btn"
              className="btn btn-secondary"
              onClick={handleSave}
              disabled={saving || publishing}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              id="publish-quiz-btn"
              className="btn btn-primary"
              onClick={handlePublish}
              disabled={saving || publishing}
            >
              <Globe size={16} />
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="section-title">Questions ({quiz.questions.length})</h2>
      </div>

      <div className="questions-list">
        {quiz.questions.map((q, i) => (
          <QuestionItem key={i} question={q} index={i} />
        ))}
      </div>
    </>
  );
}
