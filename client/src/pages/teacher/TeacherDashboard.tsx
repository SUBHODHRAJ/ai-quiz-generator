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
  ClipboardList,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import type { Quiz } from '../../types/quiz';
import { QuizStatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const first = name.split(' ')[0];
  if (hour < 12) return `Good morning, ${first} 👋`;
  if (hour < 17) return `Good afternoon, ${first} 👋`;
  return `Good evening, ${first} 👋`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await api.get('/quizzes');
        setQuizzes(res.data.data || res.data || []);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr?.response?.data?.message || 'Failed to load quizzes.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);
  const drafts = quizzes.filter(q => (q.status ?? 'draft') === 'draft').length;
  const published = quizzes.filter(q => q.status === 'published').length;
  const recent = [...quizzes].sort((a, b) => {
    const da = (a as { createdAt?: string }).createdAt ?? '';
    const db = (b as { createdAt?: string }).createdAt ?? '';
    return db.localeCompare(da);
  }).slice(0, 5);

  const stats = [
    { label: 'Total Quizzes',    value: quizzes.length, icon: <BookOpen size={20} />,  color: 'var(--color-primary)' },
    { label: 'Drafts',           value: drafts,          icon: <FileText size={20} />,  color: 'var(--color-warning)' },
    { label: 'Published',        value: published,       icon: <Globe size={20} />,     color: 'var(--color-success)' },
    { label: 'Total Questions',  value: totalQuestions,  icon: <Hash size={20} />,      color: 'var(--color-ai)' },
  ];

  return (
    <>
      {/* Greeting */}
      <div className="greeting-banner">
        <p className="greeting-time">{getGreeting(user?.name || 'Teacher')}</p>
        <p className="greeting-subtitle">Create, manage and publish AI-generated quizzes.</p>
      </div>

      {/* Enterprise positioning banner */}
      <div style={{
        background: 'var(--color-surface-mid)',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Cpu size={14} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
              Enterprise-ready AI learning
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0, maxWidth: 520, lineHeight: 1.55 }}>
            Turn training materials, SOPs and operational documentation into measurable assessments in seconds.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginTop: 2 }}>
            {[
              { icon: <ShieldCheck size={12} />, label: 'Safety Training' },
              { icon: <ClipboardList size={12} />, label: 'Compliance' },
              { icon: <Users size={12} />, label: 'Onboarding' },
              { icon: <FileText size={12} />, label: 'Operations' },
            ].map(chip => (
              <span key={chip.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-muted)',
                border: '1px solid rgba(99,102,241,0.2)',
                fontSize: 'var(--text-xs)', fontWeight: 600,
                color: 'var(--color-primary)',
              }}>
                {chip.icon}{chip.label}
              </span>
            ))}
          </div>
        </div>
        <Link to="/teacher/upload" className="btn btn-primary" id="cta-create-training-quiz" style={{ whiteSpace: 'nowrap' }}>
          <PlusCircle size={16} />
          Create Training Quiz
        </Link>
      </div>

      {/* Hero CTA */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--sp-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--sp-6)',
        flexWrap: 'wrap',
        marginBottom: 'var(--sp-8)',
      }}>
        <div>
          <div className="page-eyebrow">
            <Sparkles size={14} />
            AI-Powered
          </div>
          <h1 className="page-title">Turn any document into an assessment</h1>
          <p className="page-subtitle" style={{ marginTop: 'var(--sp-2)' }}>
            Upload training material, policy docs or SOPs — AI generates high-quality questions instantly.
          </p>
        </div>
        <Link to="/teacher/upload" className="btn btn-primary btn-lg" id="cta-create-quiz">
          <PlusCircle size={18} />
          Create Quiz
        </Link>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 'var(--sp-8)' }}>
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div
              className="stat-card-icon"
              style={{ background: `${s.color}18`, color: s.color }}
            >
              {s.icon}
            </div>
            <div className="stat-card-value">{loading ? '—' : s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Quizzes */}
      <div className="card" style={{ padding: 0 }}>
        <div className="section-header" style={{ padding: 'var(--sp-6)', borderBottom: '1px solid var(--color-border)', marginBottom: 0 }}>
          <div>
            <div className="section-title">Recent Quizzes</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Your latest AI-generated quizzes</div>
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
            title="No quizzes yet"
            description="Upload your first document and let AI create a quiz for you."
            action={
              <Link to="/teacher/upload" className="btn btn-primary" id="empty-create-quiz">
                <PlusCircle size={16} /> Create your first quiz
              </Link>
            }
          />
        )}

        {!loading && !error && recent.length > 0 && (
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
              {recent.map(quiz => (
                <tr key={quiz._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{quiz.title}</div>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{quiz.topic || '—'}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{quiz.questions?.length ?? 0}</td>
                  <td>
                    <QuizStatusBadge status={quiz.status} />
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={13} />
                    {formatDate((quiz as { createdAt?: string }).createdAt)}
                  </td>
                  <td>
                    <Link
                      to={`/teacher/quizzes/${quiz._id}`}
                      className="btn btn-ghost btn-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
