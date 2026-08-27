import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Globe,
  Trash2,
  Info,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import api from '../../services/api';
import type { Quiz, Question } from '../../types/quiz';
import { QuizStatusBadge, DifficultyBadge, QuestionTypeBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog, { AlertBox } from '../../components/ui/ConfirmDialog';

function QuestionView({ question, index }: { question: Question; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="question-number">{index + 1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-2)' }}>
            <QuestionTypeBadge type={question.type} />
            <DifficultyBadge difficulty={question.difficulty} />
          </div>
          <p className="question-text">{question.question}</p>
        </div>
      </div>

      {question.type === 'mcq' && question.options && (
        <div className="question-options">
          {question.options.map((opt, i) => {
            const isCorrect = opt === question.answer;
            return (
              <div key={i} className={`option-item ${isCorrect ? 'correct' : ''}`}>
                <span className="option-letter">{String.fromCharCode(65 + i)}.</span>
                <span style={{ flex: 1 }}>{opt}</span>
                {isCorrect && <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />}
              </div>
            );
          })}
        </div>
      )}

      {question.type === 'true_false' && (
        <div className="question-options">
          {['True', 'False'].map(opt => {
            const isCorrect = opt.toLowerCase() === question.answer?.toLowerCase();
            return (
              <div key={opt} className={`option-item ${isCorrect ? 'correct' : ''}`}>
                <span className="option-letter">{opt[0]}.</span>
                <span>{opt}</span>
                {isCorrect && <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />}
              </div>
            );
          })}
        </div>
      )}

      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setExpanded(p => !p)}
        style={{ marginTop: 'var(--sp-3)' }}
      >
        <Info size={14} />
        {expanded ? 'Hide explanation' : 'Show answer & explanation'}
      </button>

      {expanded && (
        <div className="answer-section">
          {question.type === 'short_answer' && (
            <>
              <div className="answer-section-label"><CheckCircle2 size={12} /> Answer</div>
              <div className="answer-value">{question.answer}</div>
            </>
          )}
          {question.explanation && (
            <>
              <div className="answer-section-label" style={{ marginTop: question.type === 'short_answer' ? 'var(--sp-3)' : 0 }}>
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

export default function QuizDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz]             = useState<Quiz | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [actionError, setActionError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await api.get(`/quizzes/${id}`);
        setQuiz(res.data.data || res.data);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr?.response?.data?.message || 'Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchQuiz();
  }, [id]);

  async function handlePublishToggle() {
    if (!quiz?._id) return;
    const newStatus = quiz.status === 'published' ? 'draft' : 'published';
    setActionError('');
    try {
      await api.patch(`/quizzes/${quiz._id}/status`, { status: newStatus });
      setQuiz(prev => prev ? { ...prev, status: newStatus } : prev);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr?.response?.data?.message || 'Failed to update status.');
    }
  }

  async function handleDelete() {
    if (!quiz?._id) return;
    setDeleting(true);
    try {
      await api.delete(`/quizzes/${quiz._id}`);
      navigate('/teacher/quizzes');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr?.response?.data?.message || 'Failed to delete quiz.');
      setShowDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 'var(--sp-16)', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" text="Loading quiz..." />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--sp-16)' }}>
        <AlertBox type="error" message={error || 'Quiz not found.'} />
        <Link to="/teacher/quizzes" className="btn btn-secondary" style={{ marginTop: 'var(--sp-6)' }}>
          Back to quizzes
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/teacher/quizzes" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--sp-6)', display: 'inline-flex' }}>
        <ArrowLeft size={14} /> Back to My Quizzes
      </Link>

      {actionError && <AlertBox type="error" message={actionError} />}

      {/* Quiz Header */}
      <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)', flexWrap: 'wrap' }}>
              <QuizStatusBadge status={quiz.status} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {quiz.questions.length} questions
              </span>
              {quiz.topic && (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>· {quiz.topic}</span>
              )}
            </div>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 'var(--sp-2)' }}>
              {quiz.title}
            </h1>

            {quiz.description && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                {quiz.description}
              </p>
            )}

            {quiz.sourceFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'var(--sp-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>
                <FileText size={12} /> {quiz.sourceFile}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <button
              id="toggle-publish-btn"
              className="btn btn-secondary"
              onClick={handlePublishToggle}
            >
              <Globe size={15} />
              {quiz.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
            <button
              id="delete-quiz-btn"
              className="btn btn-danger"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Questions */}
      <h2 className="section-title" style={{ marginBottom: 'var(--sp-4)' }}>
        Questions ({quiz.questions.length})
      </h2>

      <div className="questions-list">
        {quiz.questions.map((q, i) => (
          <QuestionView key={i} question={q} index={i} />
        ))}
      </div>

      {/* Delete Dialog */}
      {showDelete && (
        <ConfirmDialog
          title="Delete quiz"
          message={`Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          danger
          loading={deleting}
        />
      )}
    </>
  );
}
