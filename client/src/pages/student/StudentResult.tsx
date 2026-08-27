import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  BookOpen,
  LayoutDashboard,
  Info
} from 'lucide-react';
import api from '../../services/api';
import type { QuizAttempt } from '../../types/quiz';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function StudentResult() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [attempt, setAttempt] = useState<QuizAttempt | null>(() => {
    return (location.state as any)?.result || null;
  });
  const [loading, setLoading] = useState(!attempt);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAttempt() {
      if (!attemptId) return;
      try {
        setLoading(true);
        const res = await api.get(`/attempts/${attemptId}`);
        setAttempt(res.data.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || 'Failed to load assessment results.'
        );
      } finally {
        setLoading(false);
      }
    }

    if (!attempt && attemptId) {
      loadAttempt();
    }
  }, [attemptId, attempt]);

  if (loading) {
    return (
      <div style={{ padding: 'var(--sp-12)', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner text="Loading your assessment score..." />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center', maxWidth: 600, margin: 'var(--sp-10) auto' }}>
        <XCircle size={44} style={{ color: 'var(--color-danger)', margin: '0 auto var(--sp-4)' }} />
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
          Results Not Found
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--sp-6)' }}>
          {error || 'Unable to retrieve this attempt record.'}
        </p>
        <button className="btn btn-primary btn-md" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const percentage = attempt.percentage;
  const isPassed = percentage >= 70;
  const quizId = typeof attempt.quiz === 'object' ? (attempt.quiz as any)?._id : attempt.quiz;

  return (
    <div className="result-container" style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* ── Top Hero Score Card ── */}
      <div className="card" style={{
        padding: 'var(--sp-8)',
        marginBottom: 'var(--sp-6)',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow accent */}
        <div style={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 200,
          height: 120,
          background: isPassed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          filter: 'blur(50px)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          color: isPassed ? '#34d399' : '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--sp-3)'
        }}>
          <Award size={28} />
        </div>

        <span className="badge badge-published" style={{ textTransform: 'capitalize', marginBottom: 'var(--sp-2)' }}>
          {attempt.quizTopic || 'Workforce Assessment'}
        </span>

        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
          {attempt.quizTitle || 'Assessment Completed'}
        </h1>

        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0 0 var(--sp-6) 0' }}>
          Completed on {new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </p>

        {/* Score Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'var(--sp-4)',
          maxWidth: 620,
          margin: '0 auto var(--sp-6)'
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-4)',
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: isPassed ? '#34d399' : '#f87171' }}>
              {percentage}%
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Score Percentage
            </div>
          </div>

          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-4)',
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
              {attempt.score} / {attempt.totalQuestions}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Total Score
            </div>
          </div>

          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-4)',
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#34d399' }}>
              {attempt.correctAnswers}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Correct Answers
            </div>
          </div>

          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-4)',
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#f87171' }}>
              {attempt.totalQuestions - attempt.correctAnswers}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Incorrect Answers
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          {quizId && (
            <button
              className="btn btn-primary btn-md"
              onClick={() => navigate(`/student/quiz/${quizId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={16} /> Retake Assessment
            </button>
          )}
          <button
            className="btn btn-ghost btn-md"
            onClick={() => navigate('/student/quizzes')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <BookOpen size={16} /> All Assessments
          </button>
          <button
            className="btn btn-ghost btn-md"
            onClick={() => navigate('/student/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
        </div>
      </div>

      {/* ── Question Review Section ── */}
      <div style={{ marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
          Detailed Question Breakdown
        </h2>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {attempt.answers?.length || 0} questions reviewed
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
        {attempt.answers?.map((ans, idx) => {
          const isCorrect = ans.isCorrect;
          return (
            <div
              key={idx}
              className="card"
              style={{
                padding: 'var(--sp-5)',
                borderLeft: `4px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`,
                background: 'var(--color-surface)',
              }}
            >
              {/* Question Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    #{idx + 1}
                  </span>
                  <span className="badge badge-draft" style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                    {ans.questionType.replace('_', ' ')}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)'
                }}>
                  {isCorrect ? (
                    <>
                      <CheckCircle size={15} /> Correct
                    </>
                  ) : (
                    <>
                      <XCircle size={15} /> Incorrect
                    </>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.4, margin: '0 0 var(--sp-4) 0' }}>
                {ans.question}
              </h3>

              {/* Answers Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'var(--sp-3)',
                marginBottom: 'var(--sp-4)'
              }}>
                {/* Your Answer */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                    Your Response:
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: isCorrect ? '#34d399' : '#f87171', fontWeight: 600 }}>
                    {ans.selectedAnswer || <em style={{ opacity: 0.6 }}>No answer provided</em>}
                  </div>
                </div>

                {/* Correct Answer */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                    Expected Answer:
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>
                    {ans.correctAnswer}
                  </div>
                </div>
              </div>

              {/* Explanation */}
              {ans.explanation && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '10px 14px',
                  background: 'var(--color-surface-mid)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.5
                }}>
                  <Info size={14} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Explanation: </strong>
                    {ans.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
