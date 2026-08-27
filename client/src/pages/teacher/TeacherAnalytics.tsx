import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  BookOpen,
  Users,
  Layers
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface AnalyticsData {
  summary: {
    totalQuizzes: number;
    publishedQuizzes: number;
    draftQuizzes: number;
    totalQuestions: number;
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    completionRate: number;
  };
  scoreDistribution: Array<{ name: string; range: string; count: number }>;
  topicPerformance: Array<{ topic: string; quizzes: number; averageScore: number; attempts: number }>;
  quizPerformance: Array<{
    id: string;
    title: string;
    topic: string;
    status: string;
    questionCount: number;
    attemptsCount: number;
    averageScore: number;
    createdAt: string;
  }>;
  difficultQuestions: Array<{
    question: string;
    quizTitle: string;
    missRate: number;
    incorrectAttempts: number;
    totalAttempts: number;
  }>;
  recentAttempts: Array<{
    id: string;
    studentName: string;
    quizTitle: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: string;
  }>;
}

export default function TeacherAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quizzes/analytics');
      setData(res.data.data);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.message || 'Failed to load enterprise training analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <LoadingSpinner size="lg" />
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Aggregating assessment analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-error" style={{ margin: 'var(--sp-6) 0' }}>
        <span>{error || 'Failed to load analytics data.'}</span>
      </div>
    );
  }

  const { summary, scoreDistribution, topicPerformance, quizPerformance, difficultQuestions, recentAttempts } = data;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-eyebrow">
          <BarChart3 size={14} /> Workforce Training Analytics
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 className="page-title">Assessment Performance & Insights</h1>
            <p className="page-subtitle">
              Monitor student mastery, identify training gaps, and evaluate workforce readiness metrics.
            </p>
          </div>
          <div className="enterprise-badge">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
            Live Intelligence
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: 'var(--sp-8)' }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
            <Users size={20} />
          </div>
          <div className="stat-card-value">{summary.totalAttempts}</div>
          <div className="stat-card-label">Total Student Attempts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-ai-subtle)', color: 'var(--color-ai)' }}>
            <Award size={20} />
          </div>
          <div className="stat-card-value">{summary.averageScore}%</div>
          <div className="stat-card-label">Average Score</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-success-subtle)', color: 'var(--color-success)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-card-value">{summary.highestScore}%</div>
          <div className="stat-card-label">Top Performance</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
            <BookOpen size={20} />
          </div>
          <div className="stat-card-value">{summary.publishedQuizzes} / {summary.totalQuizzes}</div>
          <div className="stat-card-label">Published Assessments</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-8)' }}>
        {/* Score Distribution Chart */}
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>Score Distribution</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                Frequency of scores achieved by student attempts
              </p>
            </div>
            <span className="badge badge-published">Attempts: {summary.totalAttempts}</span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            {summary.totalAttempts > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border-strong)',
                      borderRadius: 8,
                      boxShadow: 'var(--shadow-md)',
                      color: 'var(--color-text)'
                    }}
                  />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                No attempt data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>Performance by Topic</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                Average comprehension percentage per workforce category
              </p>
            </div>
            <Layers size={18} style={{ color: 'var(--color-text-muted)' }} />
          </div>

          <div style={{ width: '100%', height: 260 }}>
            {topicPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicPerformance} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="topic" stroke="var(--color-text-muted)" fontSize={11} width={90} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Avg Score']}
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border-strong)',
                      borderRadius: 8,
                      color: 'var(--color-text)'
                    }}
                  />
                  <Bar dataKey="averageScore" fill="var(--color-ai)" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                No topic data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Difficult Questions Alert Box */}
      {difficultQuestions.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--sp-8)', borderLeft: '4px solid var(--color-warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-warning-subtle)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>High Difficulty / Concept Gaps Identified</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                Questions with elevated failure rates across student evaluations
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {difficultQuestions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  padding: 'var(--sp-4)',
                  background: 'var(--color-surface-low)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--sp-4)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600, marginBottom: 2 }}>
                    {q.quizTitle}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                    "{q.question}"
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className="badge badge-hard" style={{ fontSize: 12 }}>
                    {q.missRate}% Miss Rate
                  </span>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    {q.incorrectAttempts} of {q.totalAttempts} incorrect
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Matrix Table */}
      <div className="card" style={{ marginBottom: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>Assessment Analytics Matrix</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
              Detailed completion metrics and average performance by quiz
            </p>
          </div>
        </div>

        {quizPerformance.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-muted)' }}>
            No assessment records found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assessment Title</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Topic</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Questions</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Attempts</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {quizPerformance.map((q) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text)' }}>
                      {q.title}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>
                      {q.topic}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${q.status}`}>
                        {q.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>
                      {q.questionCount}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text)' }}>
                      {q.attemptsCount}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontWeight: 700,
                        color: q.averageScore >= 80 ? 'var(--color-success)' : q.averageScore >= 60 ? 'var(--color-warning)' : 'var(--color-text)'
                      }}>
                        {q.attemptsCount > 0 ? `${q.averageScore}%` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Student Submissions Feed */}
      {recentAttempts.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>
            Recent Student Submissions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {recentAttempts.map((att) => (
              <div
                key={att.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--sp-3) var(--sp-4)',
                  background: 'var(--color-surface-low)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                    {att.studentName}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {att.quizTitle} • {new Date(att.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(att.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    color: att.percentage >= 70 ? 'var(--color-success)' : 'var(--color-danger)'
                  }}>
                    {att.score}/{att.totalQuestions} ({att.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
