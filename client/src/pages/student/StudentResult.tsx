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
      <div style={{ padding: 'var(--sp-12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <LoadingSpinner size="lg" />
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Evaluating assessment score...</p>
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
    <div className="result-container" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* ── Top Hero Score Card ── */}
      <div className="card" style={{
        padding: 'var(--sp-8)',
        marginBottom: 'var(--sp-6)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top Gold Accent Stripe */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: isPassed ? 'linear-gradient(90deg, var(--color-primary), var(--color-gold))' : 'var(--color-warning)'
        }} />

        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: isPassed ? 'var(--color-success-subtle)' : 'var(--color-warning-subtle)',
          color: isPassed ? 'var(--color-success)' : 'var(--color-warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--sp-3)'
        }}>
          <Award size={32} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 'var(--sp-2)' }}>
          <span className="badge badge-published" style={{ textTransform: 'capitalize' }}>
            {attempt.quizTopic || 'Workforce Assessment'}
          </span>
          <span className={`badge ${isPassed ? 'badge-published' : 'badge-draft'}`}>
            {isPassed ? 'PASSED (≥70%)' : 'REQUIRES REVIEW'}
          </span>
        </div>

        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
          {attempt.quizTitle || 'Assessment Completed'}
        </h1>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--sp-6) 0' }}>
          Evaluation submitted on {new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </p>

        {/* Score Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 'var(--sp-3)',
          maxWidth: 640,
          margin: '0 auto var(--sp-6)'
        }}>
          <div style={{
            background: 'var(--color-surface-low)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-4)',
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: isPassed ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {percentage}%
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Score Percentage
            </div>
          </div>

          <div style={{
            background: 'var(--color-surface-low)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-4)',
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
              {attempt.score} / {attempt.totalQuestions}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Total Questions
            </div>
          </div>

          <div style={{
            background: 'var(--color-surface-low)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-4)',
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-success)' }}>
              {attempt.correctAnswers}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Correct Answers
            </div>
          </div>

          <div style={{
            background: 'var(--color-surface-low)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-4)',
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-danger)' }}>
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
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: '#fff' }}
            >
              <RotateCcw size={16} style={{ color: 'var(--color-gold)' }} /> Retake Assessment
            </button>
          )}
          <button
            className="btn btn-secondary btn-md"
            onClick={() => navigate('/student/quizzes')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <BookOpen size={16} /> All Assessments
          </button>
          <button
            className="btn btn-secondary btn-md"
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
          Detailed Question Evaluation & Explanations
        </h2>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {attempt.answers?.length || 0} questions evaluated
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
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-primary)' }}>
                    Question {idx + 1}
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
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.4, margin: '0 0 var(--sp-4) 0' }}>
                {ans.question}
              </h3>

              {/* Answers Comparison Grid */}
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
                  background: isCorrect ? 'var(--color-success-subtle)' : 'var(--color-danger-subtle)',
                  border: `1px solid ${isCorrect ? 'rgba(21, 128, 61, 0.25)' : 'rgba(185, 28, 28, 0.25)'}`,
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                    Your Submitted Response:
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                    {ans.selectedAnswer || <em style={{ opacity: 0.6 }}>No answer provided</em>}
                  </div>
                </div>

                {/* Correct Answer */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary-subtle)',
                  border: '1px solid var(--color-border-strong)',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                    Verified Correct Answer:
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 700 }}>
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
                  background: 'var(--color-surface-low)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.5,
                  borderLeft: '3px solid var(--color-gold)'
                }}>
                  <Info size={14} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Context & Explanation: </strong>
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
