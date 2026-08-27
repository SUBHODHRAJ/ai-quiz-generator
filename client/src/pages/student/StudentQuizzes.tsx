import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import api from '../../services/api';
import type { Quiz } from '../../types/quiz';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const CATEGORIES = [
  'All Categories',
  'Safety & Compliance',
  'Operations Training',
  'SOP Assessment',
  'Employee Onboarding'
];

export default function StudentQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  useEffect(() => {
    async function loadPublishedQuizzes() {
      try {
        setLoading(true);
        const res = await api.get('/quizzes/published');
        setQuizzes(res.data.data || []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || 'Failed to fetch training assessments.'
        );
      } finally {
        setLoading(false);
      }
    }
    loadPublishedQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(search.toLowerCase())) ||
      (q.description && q.description.toLowerCase().includes(search.toLowerCase()));

    const matchesDifficulty =
      difficultyFilter === 'all' || q.difficulty === difficultyFilter;

    const matchesCategory =
      categoryFilter === 'All Categories' ||
      (q.topic && q.topic.toLowerCase().includes(categoryFilter.toLowerCase())) ||
      (q.description && q.description.toLowerCase().includes(categoryFilter.toLowerCase()));

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-eyebrow">
          <Layers size={14} />
          Training Catalogue
        </div>
        <h1 className="page-title">Available Assessments</h1>
        <p className="page-subtitle">
          Explore AI-generated workforce training assessments, test your skills, and verify compliance.
        </p>
      </div>

      {/* Workforce Training Pipeline Banner */}
      <div style={{
        background: 'var(--color-surface-mid)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--sp-4) var(--sp-5)',
        marginBottom: 'var(--sp-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--sp-3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
              Workforce Training Intelligence
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Assessments generated directly from standard operating procedures and training manuals
            </div>
          </div>
        </div>
        <span className="badge badge-verified">Verified Curriculum</span>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-subtle)'
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 36 }}
              placeholder="Search assessments by title, topic, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Difficulty Filter */}
          <select
            className="form-select"
            style={{ width: 160 }}
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginTop: 'var(--sp-3)', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--color-border)' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              className={`type-chip ${categoryFilter === cat ? 'selected' : ''}`}
              onClick={() => setCategoryFilter(cat)}
              style={{ fontSize: '11px', padding: '4px 10px', height: 'auto' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div style={{ padding: 'var(--sp-12)', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner text="Loading published assessments..." />
        </div>
      ) : error ? (
        <div className="alert alert-error" style={{ marginBottom: 'var(--sp-6)' }}>
          {error}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="card" style={{ padding: 'var(--sp-10)' }}>
          <EmptyState
            icon={<BookOpen size={32} />}
            title="No assessments found"
            description={
              search || difficultyFilter !== 'all' || categoryFilter !== 'All Categories'
                ? 'Try adjusting your search query or filters to find what you are looking for.'
                : 'No published training assessments are currently available. Check back soon!'
            }
          />
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--sp-5)'
        }}>
          {filteredQuizzes.map(quiz => {
            const count = quiz.questionCount || quiz.questions?.length || 0;
            return (
              <div
                key={quiz._id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 'var(--sp-5)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 'var(--sp-3)' }}>
                    <span className="badge badge-published" style={{ textTransform: 'capitalize', fontSize: '10px' }}>
                      {quiz.topic || 'Training Assessment'}
                    </span>
                    <span className="badge" style={{
                      background: quiz.difficulty === 'hard' ? 'rgba(239, 68, 68, 0.15)' : quiz.difficulty === 'easy' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: quiz.difficulty === 'hard' ? '#f87171' : quiz.difficulty === 'easy' ? '#34d399' : '#fbbf24',
                      fontSize: '10px',
                      textTransform: 'capitalize'
                    }}>
                      {quiz.difficulty || 'Medium'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--sp-2)', lineHeight: 1.3 }}>
                    {quiz.title}
                  </h3>

                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.5,
                    marginBottom: 'var(--sp-4)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {quiz.description || 'Comprehensive training assessment covering essential concepts and standard procedures.'}
                  </p>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 'var(--sp-3)',
                    borderTop: '1px solid var(--color-border)',
                    marginBottom: 'var(--sp-3)'
                  }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {count} questions
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)' }}>
                      ~{Math.max(Math.round(count * 1.5), 5)} mins
                    </span>
                  </div>

                  <button
                    className="btn btn-primary btn-full btn-md"
                    onClick={() => navigate(`/student/quiz/${quiz._id}`)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    Start Assessment <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
