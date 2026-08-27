import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  FileText,
  Globe,
  Hash,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  Users,
  Award,
  BarChart3,
  Building2,
  Workflow
} from 'lucide-react';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import type { Quiz } from '../../types/quiz';
import { QuizStatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const first = name.split(' ')[0];
  if (hour < 12) return `Good morning, ${first}`;
  if (hour < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const PIE_COLORS = ['#15803D', '#B45309', '#351C15'];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [statsData, setStatsData] = useState<{
    totalQuizzes: number;
    drafts: number;
    published: number;
    totalQuestions: number;
    totalAttempts: number;
    averageScore: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [quizRes, statsRes] = await Promise.all([
          api.get('/quizzes'),
          api.get('/quizzes/stats').catch(() => ({ data: { data: null } }))
        ]);

        setQuizzes(quizRes.data.data || []);
        if (statsRes.data.data) {
          setStatsData(statsRes.data.data);
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr?.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalQuestions = statsData?.totalQuestions ?? quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);
  const drafts = statsData?.drafts ?? quizzes.filter(q => (q.status ?? 'draft') === 'draft').length;
  const published = statsData?.published ?? quizzes.filter(q => q.status === 'published').length;
  const totalAttempts = statsData?.totalAttempts ?? 0;
  const averageScore = statsData?.averageScore ?? 0;

  const recent = [...quizzes].sort((a, b) => {
    const da = (a as { createdAt?: string }).createdAt ?? '';
    const db = (b as { createdAt?: string }).createdAt ?? '';
    return db.localeCompare(da);
  }).slice(0, 5);

  const stats = [
    { label: 'Total Quizzes',    value: quizzes.length, icon: <BookOpen size={20} />,  color: 'var(--color-primary)' },
    { label: 'Published',        value: published,       icon: <Globe size={20} />,     color: 'var(--color-success)' },
    { label: 'Drafts',           value: drafts,          icon: <FileText size={20} />,  color: 'var(--color-warning)' },
    { label: 'Total Questions',  value: totalQuestions,  icon: <Hash size={20} />,      color: 'var(--color-gold)' },
    { label: 'Student Attempts', value: totalAttempts,   icon: <Users size={20} />,     color: 'var(--color-primary)' },
    { label: 'Average Score',    value: `${averageScore}%`, icon: <Award size={20} />,   color: 'var(--color-ai)' },
  ];

  const statusDistribution = [
    { name: 'Published', value: published },
    { name: 'Drafts', value: drafts },
  ].filter(d => d.value > 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Greeting */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="page-eyebrow">
          <Building2 size={14} /> Training Operations Center
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 className="page-title">{getGreeting(user?.name || 'Trainer')} 👋</h1>
            <p className="page-subtitle">Create, manage, and evaluate AI-generated enterprise assessments.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <Link to="/teacher/analytics" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart3 size={16} /> View Analytics
            </Link>
            <Link to="/teacher/upload" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: '#fff' }}>
              <PlusCircle size={16} style={{ color: 'var(--color-gold)' }} /> Create Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Enterprise Positioning Card */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--sp-5) var(--sp-6)',
        marginBottom: 'var(--sp-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--sp-6)',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Workflow size={14} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
              Built for workforce-ready learning
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0, maxWidth: 580, lineHeight: 1.5 }}>
            From training manuals and SOPs to verifiable employee evaluations with automated scoring and concept feedback.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          {[
            { icon: <ShieldCheck size={12} />, label: 'Safety & Compliance' },
            { icon: <FileText size={12} />, label: 'Operations Training' },
            { icon: <Award size={12} />, label: 'SOP Assessment' },
          ].map(chip => (
            <span key={chip.label} className="enterprise-badge">
              {chip.icon}{chip.label}
            </span>
          ))}
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="stat-grid" style={{ marginBottom: 'var(--sp-8)' }}>
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div
              className="stat-card-icon"
              style={{ background: 'var(--color-surface-high)', color: s.color }}
            >
              {s.icon}
            </div>
            <div className="stat-card-value">{loading ? '—' : s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts & Highlights Grid */}
      {quizzes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-8)' }}>
          {/* Assessment Creation Breakdown */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>Lifecycle Status</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                  Distribution of drafts vs published assessments
                </p>
              </div>
              <span className="badge badge-published">{published} Active</span>
            </div>

            <div style={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border-strong)',
                      borderRadius: 8,
                      color: 'var(--color-text)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-6)', marginTop: 'var(--sp-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#15803D' }} />
                Published ({published})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#B45309' }} />
                Drafts ({drafts})
              </div>
            </div>
          </div>

          {/* Quick Actions & AI Summary */}
          <div className="card" style={{ padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--sp-2)' }}>
                <Sparkles size={16} style={{ color: 'var(--color-gold)' }} />
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>Intelligent Quiz Generation</h3>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: 'var(--sp-4)' }}>
                Upload PDF safety manuals, DOCX standard operating procedures, or markdown training content to build verifiable tests in seconds.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <Link to="/teacher/upload" className="btn btn-primary btn-md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--color-primary)', color: '#fff' }}>
                <PlusCircle size={16} style={{ color: 'var(--color-gold)' }} /> Create New Assessment
              </Link>
              <Link to="/teacher/analytics" className="btn btn-secondary btn-md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <BarChart3 size={16} /> View Deep Performance Analytics
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Quizzes */}
      <div className="card" style={{ padding: 0 }}>
        <div className="section-header" style={{ padding: 'var(--sp-6)', borderBottom: '1px solid var(--color-border)', marginBottom: 0 }}>
          <div>
            <div className="section-title">Recent Assessments</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Latest AI-generated training assessments</div>
          </div>
          <Link to="/teacher/quizzes" className="btn btn-ghost btn-sm" id="view-all-quizzes">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading && (
          <div style={{ padding: 'var(--sp-10)', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner text="Loading quizzes..." />
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: 'var(--sp-6)' }}>
            <div className="alert alert-error">{error}</div>
          </div>
        )}

        {!loading && !error && quizzes.length === 0 && (
          <EmptyState
            icon={<BookOpen size={32} />}
            title="No assessments created yet"
            description="Upload your first training document and let AI create a quiz for you."
            action={
              <Link to="/teacher/upload" className="btn btn-primary" id="empty-create-quiz" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                <PlusCircle size={16} style={{ color: 'var(--color-gold)' }} /> Create your first quiz
              </Link>
            }
          />
        )}

        {!loading && !error && recent.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Topic</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map(quizItem => (
                  <tr key={quizItem._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{quizItem.title}</div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{quizItem.topic || 'General'}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{quizItem.questions?.length ?? 0}</td>
                    <td>
                      <QuizStatusBadge status={quizItem.status} />
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} />
                      {formatDate((quizItem as { createdAt?: string }).createdAt)}
                    </td>
                    <td>
                      <Link
                        to={`/teacher/quizzes/${quizItem._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
