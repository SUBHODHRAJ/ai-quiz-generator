import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  PlusCircle,
  Trash2,
  Eye,
  Globe,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import type { Quiz } from '../../types/quiz';
import { QuizStatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog, { AlertBox } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

type StatusFilter = 'all' | 'draft' | 'verified' | 'published';
type SortOption = 'newest' | 'oldest' | 'questions' | 'score';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function MyQuizzes() {
  const toast = useToast();
  const [quizzes, setQuizzes]         = useState<(Quiz & { attemptsCount?: number; averageScore?: number })[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState<StatusFilter>('all');
  const [sort, setSort]               = useState<SortOption>('newest');
  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    setLoading(true);
    setError('');
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

  const filtered = useMemo(() => {
    let result = quizzes.filter(q => {
      const matchesSearch =
        !search ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        (q.topic || '').toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === 'all' || (q.status ?? 'draft') === filter;
      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      if (sort === 'newest') {
        const da = (a as { createdAt?: string }).createdAt ?? '';
        const db = (b as { createdAt?: string }).createdAt ?? '';
        return db.localeCompare(da);
      }
      if (sort === 'oldest') {
        const da = (a as { createdAt?: string }).createdAt ?? '';
        const db = (b as { createdAt?: string }).createdAt ?? '';
        return da.localeCompare(db);
      }
      if (sort === 'questions') {
        return (b.questions?.length || 0) - (a.questions?.length || 0);
      }
      if (sort === 'score') {
        return (b.averageScore || 0) - (a.averageScore || 0);
      }
      return 0;
    });

    return result;
  }, [quizzes, search, filter, sort]);

  async function handleDelete() {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      await api.delete(`/quizzes/${deleteTarget._id}`);
      setQuizzes(prev => prev.filter(q => q._id !== deleteTarget._id));
      toast.success(`Assessment "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message || 'Failed to delete quiz.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  }

  async function handlePublish(quizItem: Quiz) {
    if (!quizItem._id) return;
    const newStatus = quizItem.status === 'published' ? 'draft' : 'published';
    try {
      await api.patch(`/quizzes/${quizItem._id}/status`, { status: newStatus });
      setQuizzes(prev => prev.map(q => q._id === quizItem._id ? { ...q, status: newStatus } : q));
      if (newStatus === 'published') {
        toast.success(`"${quizItem.title}" is now published and available to learners.`);
      } else {
        toast.info(`"${quizItem.title}" moved to draft status.`);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to update status.');
    }
  }

  const filterCounts: Record<StatusFilter, number> = {
    all:       quizzes.length,
    draft:     quizzes.filter(q => (q.status ?? 'draft') === 'draft').length,
    verified:  quizzes.filter(q => q.status === 'verified').length,
    published: quizzes.filter(q => q.status === 'published').length,
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
        <div>
          <h1 className="page-title">My Assessment Repository</h1>
          <p className="page-subtitle">Manage, edit, evaluate and publish your AI-generated training assessments.</p>
        </div>
        <Link to="/teacher/upload" className="btn btn-primary" id="create-quiz-btn" style={{ background: 'var(--color-primary)', color: '#fff' }}>
          <PlusCircle size={16} style={{ color: 'var(--color-gold)' }} /> Create Assessment
        </Link>
      </div>

      {error && <AlertBox type="error" message={error} />}

      {/* Filter & Sort Bar */}
      <div className="filter-bar" style={{ marginTop: 'var(--sp-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div className="search-wrapper" style={{ flex: 1, minWidth: 260 }}>
          <span className="search-icon"><Search size={16} /></span>
          <input
            id="quiz-search"
            type="text"
            className="search-input"
            placeholder="Search assessments by title or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <div className="filter-tabs">
            {(['all', 'published', 'draft'] as StatusFilter[]).map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
                id={`filter-${f}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({filterCounts[f]})
              </button>
            ))}
          </div>

          <select
            className="form-select"
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            style={{ width: 'auto', padding: '8px 12px', fontSize: 'var(--text-xs)' }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="questions">Sort: Most Questions</option>
            <option value="score">Sort: Highest Avg Score</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 'var(--sp-4)' }}>
        {loading && (
          <div style={{ padding: 'var(--sp-10)', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner text="Loading assessment repository..." />
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={<BookOpen size={32} />}
            title={search || filter !== 'all' ? 'No assessments match your filters' : 'No assessments yet'}
            description={
              search || filter !== 'all'
                ? 'Try adjusting your search query or filter criteria.'
                : 'Upload your first learning document to generate an assessment.'
            }
            action={
              !search && filter === 'all' ? (
                <Link to="/teacher/upload" className="btn btn-primary" id="empty-create-btn" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                  <PlusCircle size={16} style={{ color: 'var(--color-gold)' }} /> Create your first quiz
                </Link>
              ) : undefined
            }
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assessment Title</th>
                  <th>Topic</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Student Attempts</th>
                  <th>Avg Score</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(quizItem => (
                  <tr key={quizItem._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)', maxWidth: 260 }} className="truncate">
                        {quizItem.title}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', maxWidth: 140 }} className="truncate">
                      {quizItem.topic || 'General'}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{quizItem.questions?.length ?? 0}</td>
                    <td><QuizStatusBadge status={quizItem.status} /></td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                      {quizItem.attemptsCount || 0}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: (quizItem.averageScore || 0) >= 80 ? 'var(--color-success)' : (quizItem.averageScore || 0) >= 60 ? 'var(--color-warning)' : 'var(--color-text-muted)'
                      }}>
                        {quizItem.attemptsCount && quizItem.attemptsCount > 0 ? `${quizItem.averageScore}%` : '—'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                        <Clock size={13} />
                        {formatDate((quizItem as { createdAt?: string }).createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="action-row">
                        <Link
                          to={`/teacher/quizzes/${quizItem._id}`}
                          className="btn btn-ghost btn-sm"
                          title="View & Edit Assessment"
                          id={`view-quiz-${quizItem._id}`}
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          className="btn btn-ghost btn-sm"
                          title={quizItem.status === 'published' ? 'Unpublish (Move to Draft)' : 'Publish immediately'}
                          id={`publish-quiz-${quizItem._id}`}
                          onClick={() => handlePublish(quizItem)}
                          style={{ color: quizItem.status === 'published' ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                        >
                          <Globe size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Delete quiz"
                          id={`delete-quiz-${quizItem._id}`}
                          onClick={() => setDeleteTarget(quizItem)}
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Assessment"
          message={`Are you sure you want to permanently delete "${deleteTarget.title}" and its associated evaluation attempts?`}
          confirmLabel="Delete Assessment"
          cancelLabel="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
          loading={deleting}
        />
      )}
    </div>
  );
}
