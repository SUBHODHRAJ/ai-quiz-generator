import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Send
} from 'lucide-react';
import api from '../../services/api';
import type { Quiz } from '../../types/quiz';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function StudentQuiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/${id}`);
        const data: Quiz = res.data.data;
        setQuiz(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || 'Unable to load the requested assessment.'
        );
      } finally {
        setLoading(false);
      }
    }
    if (id) loadQuiz();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 'var(--sp-12)', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner text="Preparing your assessment..." />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center', maxWidth: 600, margin: 'var(--sp-10) auto' }}>
        <AlertCircle size={44} style={{ color: 'var(--color-danger)', margin: '0 auto var(--sp-4)' }} />
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
          Assessment Unavailable
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--sp-6)' }}>
          {error || 'The quiz you are trying to access could not be found.'}
        </p>
        <button className="btn btn-primary btn-md" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter(k => answers[Number(k)]?.trim()).length;
  const currentAnswer = answers[currentIndex] || '';

  const handleSelectOption = (option: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: option
    }));
  };

  const handleShortAnswerChange = (val: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: val
    }));
  };

  const handleSubmitAttempt = async () => {
    setShowSubmitConfirm(false);
    setSubmitting(true);
    setError('');

    try {
      // Build answers payload: array of { questionIndex, answer }
      const formattedAnswers = questions.map((_, idx) => ({
        questionIndex: idx,
        answer: answers[idx] || ''
      }));

      const res = await api.post(`/quizzes/${quiz._id}/attempts`, {
        answers: formattedAnswers
      });

      const attemptId = res.data.data.attemptId;
      navigate(`/student/result/${attemptId}`, {
        state: { result: res.data.data }
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to submit quiz attempt. Please try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="quiz-take-container" style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/student/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Exit Assessment
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Answered: <strong style={{ color: 'var(--color-primary)' }}>{answeredCount}</strong> / {totalQuestions}
          </span>
          <span className="badge badge-published" style={{ textTransform: 'capitalize' }}>
            {quiz.topic || 'Assessment'}
          </span>
        </div>
      </div>

      {/* Quiz Title Card */}
      <div className="card" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
        <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 6px 0' }}>
          {quiz.title}
        </h1>
        {quiz.description && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
            {quiz.description}
          </p>
        )}

        {/* Progress Bar */}
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <div style={{
            height: 6,
            background: 'var(--color-surface-mid)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            display: 'flex'
          }}>
            <div
              style={{
                width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: 6 }}>
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(((currentIndex + 1) / totalQuestions) * 100)}% Complete</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--sp-4)' }}>
          {error}
        </div>
      )}

      {/* Question Card */}
      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
          <span style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Question {currentIndex + 1}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span className="badge badge-draft" style={{ textTransform: 'capitalize', fontSize: '10px' }}>
              {currentQ.type.replace('_', ' ')}
            </span>
            <span className="badge" style={{
              background: currentQ.difficulty === 'hard' ? 'rgba(239, 68, 68, 0.15)' : currentQ.difficulty === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: currentQ.difficulty === 'hard' ? '#f87171' : currentQ.difficulty === 'medium' ? '#fbbf24' : '#34d399',
              fontSize: '10px',
              textTransform: 'capitalize'
            }}>
              {currentQ.difficulty}
            </span>
          </div>
        </div>

        {/* Question Text */}
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 'var(--sp-6)' }}>
          {currentQ.question}
        </h2>

        {/* Option Inputs */}
        {currentQ.type === 'mcq' && currentQ.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = currentAnswer === opt;
              const letter = String.fromCharCode(65 + oIdx);
              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--sp-3)',
                    padding: 'var(--sp-3) var(--sp-4)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--color-surface-mid)',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: isSelected ? '#fff' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 'var(--text-xs)',
                    flexShrink: 0
                  }}>
                    {letter}
                  </div>
                  <span style={{ fontSize: 'var(--text-sm)', flex: 1 }}>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {currentQ.type === 'true_false' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            {['True', 'False'].map((opt) => {
              const isSelected = currentAnswer.toLowerCase() === opt.toLowerCase();
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    padding: 'var(--sp-4)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--color-surface-mid)',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {currentQ.type === 'short_answer' && (
          <div>
            <textarea
              className="form-input"
              rows={3}
              value={currentAnswer}
              onChange={(e) => handleShortAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              style={{ width: '100%', resize: 'vertical' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: 6, display: 'block' }}>
              Tip: Provide a concise and accurate response based on the training material.
            </span>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
        <button
          className="btn btn-ghost btn-md"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Previous
        </button>

        {/* Question Palette */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {questions.map((_, pIdx) => {
            const hasAns = Boolean(answers[pIdx]?.trim());
            const isCurr = pIdx === currentIndex;
            return (
              <button
                key={pIdx}
                type="button"
                onClick={() => setCurrentIndex(pIdx)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-sm)',
                  background: isCurr
                    ? 'var(--color-primary)'
                    : hasAns
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'var(--color-surface-mid)',
                  border: `1px solid ${isCurr ? 'var(--color-primary)' : hasAns ? 'rgba(16, 185, 129, 0.4)' : 'var(--color-border)'}`,
                  color: isCurr ? '#fff' : hasAns ? '#34d399' : 'var(--color-text-muted)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {pIdx + 1}
              </button>
            );
          })}
        </div>

        {currentIndex < totalQuestions - 1 ? (
          <button
            className="btn btn-primary btn-md"
            onClick={() => setCurrentIndex(prev => prev + 1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button
            className="btn btn-success btn-md"
            onClick={() => setShowSubmitConfirm(true)}
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-success)', color: '#fff' }}
          >
            <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showSubmitConfirm && (
        <ConfirmDialog
          title="Submit Assessment?"
          message={`You have answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to finish and view your verified score?`}
          confirmLabel="Yes, Submit Assessment"
          cancelLabel="Review Questions"
          onConfirm={handleSubmitAttempt}
          onCancel={() => setShowSubmitConfirm(false)}
          loading={submitting}
        />
      )}
    </div>
  );
}
