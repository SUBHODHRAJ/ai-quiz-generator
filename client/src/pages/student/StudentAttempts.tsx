import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Calendar,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import api from '../../services/api';
import type { QuizAttempt } from '../../types/quiz';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function StudentAttempts() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attempts/my');
      setAttempts(res.data.data || []);
    } catch (err: any) {
      console.error('Failed to load attempts:', err);
      setError(err.response?.data?.message || 'Failed to load attempt history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <LoadingSpinner size="lg" />
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading assessment history...</p>
      </div>
    );
  }

  const averageScore = attempts.length
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
    : 0;

  const passedCount = attempts.filter((a) => a.percentage >= 70).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-eyebrow">
          <Award size={14} /> Learning Evaluation Record
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 className="page-title">My Assessment Attempts</h1>
            <p className="page-subtitle">
              Review your historical scores, concept mastery breakdowns, and past test submissions.
            </p>
          </div>
          <button
            className="btn btn-primary btn-md"
            onClick={() => navigate('/student/quizzes')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <BookOpen size={16} /> Take New Assessment
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--sp-6)' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="stat-grid" style={{ marginBottom: 'var(--sp-8)' }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
            <Award size={20} />
          </div>
          <div className="stat-card-value">{attempts.length}</div>
          <div className="stat-card-label">Completed Evaluations</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-ai-subtle)', color: 'var(--color-ai)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-card-value">{averageScore}%</div>
          <div className="stat-card-label">Average Performance</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-success-subtle)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-card-value">{passedCount} / {attempts.length}</div>
          <div className="stat-card-label">Assessments Passed (≥70%)</div>
        </div>
      </div>

      {/* Attempts List */}
      {attempts.length === 0 ? (
        <div className="card empty-state" style={{ padding: 'var(--sp-12)' }}>
          <div className="empty-state-icon">
            <Award size={32} />
          </div>
          <div className="empty-state-title">No evaluations completed yet</div>
          <div className="empty-state-text">
            Start a published assessment from the catalogue to measure your understanding and build your score history.
          </div>
          <button
            className="btn btn-primary btn-md"
            onClick={() => navigate('/student/quizzes')}
            style={{ marginTop: 'var(--sp-4)' }}
          >
            Explore Available Quizzes
          </button>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assessment</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Topic</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Score</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Result</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date Submitted</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => {
                  const isPass = att.percentage >= 70;
                  const dateStr = new Date(att.submittedAt || att.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr key={att._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text)' }}>
                        {att.quizTitle}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>
                        {att.quizTopic || 'General'}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        {att.score} / {att.totalQuestions} ({att.percentage}%)
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${isPass ? 'badge-published' : 'badge-draft'}`}>
                          {isPass ? 'PASSED' : 'NEEDS REVIEW'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={13} /> {dateStr}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/student/result/${att._id}`)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          View Breakdown <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
