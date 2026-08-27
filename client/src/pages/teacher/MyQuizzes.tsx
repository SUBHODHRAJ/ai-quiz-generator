import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  PlusCircle,
  Trash2,
  Eye,
  Globe,
  Clock,
} from 'lucide-react';
import api from '../../services/api';
import type { Quiz } from '../../types/quiz';
import { QuizStatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { AlertBox } from '../../components/ui/ConfirmDialog';

type StatusFilter = 'all' | 'draft' | 'verified' | 'published';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function MyQuizzes() {
  const [quizzes, setQuizzes]         = useState<Quiz[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState<StatusFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

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
    return quizzes.filter(q => {
      const matchesSearch =
        !search ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        (q.topic || '').toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === 'all' || (q.status ?? 'draft') === filter;
      return matchesSearch && matchesFilter;
    });
  }, [quizzes, search, filter]);

  async function handleDelete() {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    setActionError('');
    try {
      await api.delete(`/quizzes/${deleteTarget._id}`);
      setQuizzes(prev => prev.filter(q => q._id !== deleteTarget._id));
      setActionSuccess('Quiz deleted.');
      setDeleteTarget(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr?.response?.data?.message || 'Failed to delete quiz.');
    } finally {
      setDeleting(false);
    }
  }

  async function handlePublish(quiz: Quiz) {
    if (!quiz._id) return;
    setActionError('');
    const newStatus = quiz.status === 'published' ? 'draft' : 'published';
    try {
      await api.patch(`/quizzes/${quiz._id}/status`, { status: newStatus });
      setQuizzes(prev => prev.map(q => q._id === quiz._id ? { ...q, status: newStatus } : q));
      setActionSuccess(newStatus === 'published' ? 'Quiz published!' : 'Quiz moved to draft.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr?.response?.data?.message || 'Failed to update status.');
    }
  }

  const filterCounts: Record<StatusFilter, number> = {
    all:       quizzes.length,
    draft:     quizzes.filter(q => (q.status ?? 'draft') === 'draft').length,
    verified:  quizzes.filter(q => q.status === 'verified').length,
    published: quizzes.filter(q => q.status === 'published').length,
  };

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
        <div>
          <h1 className="page-title">My Quizzes</h1>
          <p className="page-subtitle">Manage, edit and publish your AI-generated quizzes.</p>
        </div>
        <Link to="/teacher/upload" className="btn btn-primary" id="create-quiz-btn">
          <PlusCircle size={16} /> Create Quiz
        </Link>
      </div>

      {/* Feedback */}
      {actionError && <AlertBox type="error" message={actionError} />}
      {actionSuccess && <AlertBox type="success" message={actionSuccess} />}

      {/* Filter Bar */}
      <div className="filter-bar" style={{ marginTop: 'var(--sp-4)' }}>
        <div className="search-wrapper">
          <span className="search-icon"><Search size={16} /></span>
          <input
            id="quiz-search"
            type="text"
            className="search-input"
            placeholder="Search quizzes..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActionSuccess(''); }}
          />
        </div>

        <div className="filter-tabs">
          {(['all', 'draft', 'verified', 'published'] as StatusFilter[]).map(f => (
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
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && (
          <div style={{ padding: 'var(--sp-10)', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner text="Loading your quizzes..." />
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: 'var(--sp-6)' }}>
            <AlertBox type="error" message={error} />
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={<BookOpen size={32} />}
            title={search || filter !== 'all' ? 'No quizzes match your filters' : 'No quizzes yet'}
            description={
              search || filter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first AI-powered quiz now.'
            }
            action={
              !search && filter === 'all' ? (
                <Link to="/teacher/upload" className="btn btn-primary" id="empty-create-btn">
                  <PlusCircle size={16} /> Create a quiz
                </Link>
              ) : undefined
            }
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Topic</th>
                <th>Questions</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(quiz => (
                <tr key={quiz._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', maxWidth: 280 }} className="truncate">
                      {quiz.title}
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', maxWidth: 160 }} className="truncate">
                    {quiz.topic || '—'}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{quiz.questions?.length ?? 0}</td>
                  <td><QuizStatusBadge status={quiz.status} /></td>
                  <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={13} />
                      {formatDate((quiz as { createdAt?: string }).createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className="action-row">
                      <Link
                        to={`/teacher/quizzes/${quiz._id}`}
                        className="btn btn-ghost btn-sm"
                        title="View quiz"
                        id={`view-quiz-${quiz._id}`}
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        className="btn btn-ghost btn-sm"
                        title={quiz.status === 'published' ? 'Unpublish' : 'Publish'}
                        id={`publish-quiz-${quiz._id}`}
                        onClick={() => handlePublish(quiz)}
                        style={{ color: quiz.status === 'published' ? 'var(--color-success)' : undefined }}
                      >
                        <Globe size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Delete quiz"
                        id={`delete-quiz-${quiz._id}`}
                        onClick={() => { setDeleteTarget(quiz); setActionSuccess(''); setActionError(''); }}
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
        )}
      </div>

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete quiz"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
          loading={deleting}
        />
      )}
    </>
  );
}
