import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Target,
  ArrowRight,
  Clock,
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import type { Quiz, StudentStats } from '../../types/quiz';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const first = name.split(' ')[0];
  if (hour < 12) return `Good morning, ${first}`;
  if (hour < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [quizzesRes, statsRes] = await Promise.allSettled([
          api.get('/quizzes/published'),
          api.get('/attempts/stats')
        ]);

        if (quizzesRes.status === 'fulfilled') {
          setQuizzes(quizzesRes.value.data.data || []);
        }

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data.data);
        }
      } catch (err: any) {
        setError('Failed to load student dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const statItems = [
    {
      label: 'Available Quizzes',
      value: loading ? '—' : String(stats?.availableQuizzes ?? quizzes.length),
      icon: <BookOpen size={20} />,
      color: 'var(--color-primary)',
      note: 'Ready for evaluation',
    },
    {
      label: 'Quizzes Completed',
      value: loading ? '—' : String(stats?.quizzesCompleted ?? 0),
      icon: <CheckCircle2 size={20} />,
      color: 'var(--color-success)',
      note: 'Verified evaluations',
    },
    {
      label: 'Average Score',
      value: loading ? '—' : stats?.averageScore ? `${stats.averageScore}%` : '0%',
      icon: <Target size={20} />,
      color: 'var(--color-warning)',
      note: 'Overall comprehension',
    },
    {
      label: 'Learning Streak',
      value: loading ? '—' : `${stats?.learningStreak ?? 0} day${(stats?.learningStreak ?? 0) === 1 ? '' : 's'}`,
      icon: <TrendingUp size={20} />,
      color: 'var(--color-gold)',
      note: 'Active consistency',
    },
  ];

  const scoreHistory = (stats as any)?.scoreHistory || [];
  const topicBreakdown = (stats as any)?.topicBreakdown || [];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Greeting Banner */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="page-eyebrow">
          <ShieldCheck size={14} /> Trainee Learning Portal
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 className="page-title">{getGreeting(user?.name || 'Learner')} 👋</h1>
            <p className="page-subtitle">
              Continue your workforce training pathway and achieve assessment mastery.
            </p>
          </div>
          <button
            className="btn btn-primary btn-md"
            onClick={() => navigate('/student/quizzes')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: '#fff' }}
          >
            Explore Catalogue <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: 'var(--sp-8)' }}>
        {statItems.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon" style={{ background: 'var(--color-surface-high)', color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', marginTop: 4 }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* Performance Trends Row */}
      {scoreHistory.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-8)' }}>
          {/* Score Trend LineChart */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>Score Progression</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                  Recent assessment performance trajectory
                </p>
              </div>
              <TrendingUp size={18} style={{ color: 'var(--color-success)' }} />
            </div>

            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={11} tickFormatter={(v) => `${v}%`} tickLine={false} />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Score']}
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border-strong)',
                      borderRadius: 8,
                      color: 'var(--color-text)'
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={3} dot={{ fill: 'var(--color-gold)', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Topic Mastery BarChart */}
          {topicBreakdown.length > 0 && (
            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>Topic Comprehension</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                    Average score achieved by subject area
                  </p>
                </div>
                <Award size={18} style={{ color: 'var(--color-gold)' }} />
              </div>

              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="topic" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={11} tickFormatter={(v) => `${v}%`} tickLine={false} />
                    <Tooltip
                      formatter={(v: any) => [`${v}%`, 'Average']}
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border-strong)',
                        borderRadius: 8,
                        color: 'var(--color-text)'
                      }}
                    />
                    <Bar dataKey="averageScore" fill="var(--color-gold)" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Section: Available Quizzes ── */}
      <div className="card" style={{ padding: 0, marginBottom: 'var(--sp-8)' }}>
        <div
          className="section-header"
          style={{ padding: 'var(--sp-6)', borderBottom: '1px solid var(--color-border)', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <div className="section-title">Available Training Assessments</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Verified training material assessments ready for completion
            </div>
          </div>
          <Link
            to="/student/quizzes"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            View All ({quizzes.length}) <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--sp-10)', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner text="Loading training assessments..." />
          </div>
        ) : error ? (
          <div style={{ padding: 'var(--sp-6)' }}>
            <div className="alert alert-error">{error}</div>
          </div>
        ) : quizzes.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={32} />}
            title="No published quizzes available"
            description="Your instructor has not published any quizzes yet. Check back soon!"
          />
        ) : (
          <div style={{ display: 'grid', gap: 'var(--sp-1)' }}>
            {quizzes.slice(0, 5).map(quiz => {
              const count = quiz.questionCount || quiz.questions?.length || 0;
              return (
                <div
                  key={quiz._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--sp-4)',
                    padding: 'var(--sp-4) var(--sp-6)',
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'background var(--transition)',
                  }}
                  className="card-hover"
                >
                  <div
                    style={{
                      width: 42, height: 42, borderRadius: 'var(--radius-md)',
                      background: 'var(--color-primary-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-primary)', flexShrink: 0,
                    }}
                  >
                    <BookOpen size={20} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }} className="truncate">
                      {quiz.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {count} questions
                      </span>
                      {quiz.topic && (
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>· {quiz.topic}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexShrink: 0 }}>
                    <span className="badge badge-published" style={{ textTransform: 'capitalize', fontSize: '10px' }}>
                      {quiz.difficulty || 'Medium'}
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      id={`take-quiz-${quiz._id}`}
                      onClick={() => navigate(`/student/quiz/${quiz._id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-primary)', color: '#fff' }}
                    >
                      Start Quiz <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Section: Recent Attempts ── */}
      <div className="card" style={{ padding: 0 }}>
        <div className="section-header" style={{ padding: 'var(--sp-6)', borderBottom: '1px solid var(--color-border)', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="section-title">Recent Attempt History</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Your submitted assessments and performance breakdown
            </div>
          </div>
          <Link
            to="/student/attempts"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            All History <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--sp-8)', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner text="Loading attempt history..." />
          </div>
        ) : !stats?.recentAttempts || stats.recentAttempts.length === 0 ? (
          <div style={{ padding: 'var(--sp-6)' }}>
            <EmptyState
              icon={<Award size={28} />}
              title="No attempts yet"
              description="Select any available quiz above to start your first assessment."
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--sp-1)' }}>
            {stats.recentAttempts.map(attempt => {
              const isPassed = attempt.percentage >= 70;
              return (
                <div
                  key={attempt._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--sp-4) var(--sp-6)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                  className="card-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 'var(--radius-md)',
                      background: isPassed ? 'var(--color-success-subtle)' : 'var(--color-warning-subtle)',
                      color: isPassed ? 'var(--color-success)' : 'var(--color-warning)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 'var(--text-sm)'
                    }}>
                      {attempt.percentage}%
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                        {attempt.quizTitle}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Score: {attempt.score}/{attempt.totalQuestions}</span>
                        <span>·</span>
                        <span>{new Date(attempt.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/student/result/${attempt._id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    View Results <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
