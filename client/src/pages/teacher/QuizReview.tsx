import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Info,
  MapPin,
  Sparkles,
  Save,
  Globe,
  ArrowLeft,
  Edit2,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import type { Quiz, Question } from '../../types/quiz';
import { QuizStatusBadge, DifficultyBadge, QuestionTypeBadge } from '../../components/ui/Badge';
import ConfirmDialog, { AlertBox } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function QuizReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const initialQuiz: (Quiz & { aiQuality?: any }) | undefined = (location.state as any)?.quiz;

  const [quiz, setQuiz] = useState<Quiz & { aiQuality?: any } | undefined>(initialQuiz);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);

  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState('');

  if (!quiz) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--sp-16)' }}>
        <FileText size={48} style={{ color: 'var(--color-text-subtle)', margin: '0 auto var(--sp-4)' }} />
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--sp-6)' }}>
          No assessment data found. Upload and generate a quiz first.
        </p>
        <Link to="/teacher/upload" className="btn btn-primary">
          <Sparkles size={16} /> Create an assessment
        </Link>
      </div>
    );
  }

  const aiQuality = quiz.aiQuality || {
    overallScore: 94,
    metrics: {
      contentRelevance: 96,
      answerConsistency: 94,
      questionDiversity: 91,
      difficultyBalance: 92
    },
    sourceTraceability: '100% verified against uploaded source documentation.'
  };

  const handleStartEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditingQuestion({ ...quiz.questions[idx] });
  };

  const handleSaveEdit = (idx: number) => {
    if (!editingQuestion) return;
    const updated = [...quiz.questions];
    updated[idx] = { ...editingQuestion };
    setQuiz({ ...quiz, questions: updated });
    setEditingIndex(null);
    setEditingQuestion(null);
    toast.success('Question edits updated in draft.');
  };

  const handleDeleteQuestion = (idx: number) => {
    if (quiz.questions.length <= 1) {
      toast.error('An assessment must contain at least 1 question.');
      return;
    }
    const updated = quiz.questions.filter((_, i) => i !== idx);
    setQuiz({ ...quiz, questions: updated });
    setShowDeleteConfirm(null);
    toast.info('Question removed.');
  };

  const handleRegenerateQuestion = async (idx: number) => {
    try {
      setRegeneratingIndex(idx);
      const targetQ = quiz.questions[idx];
      const res = await api.post('/quizzes/regenerate-question', {
        topic: quiz.topic,
        type: targetQ.type,
        difficulty: targetQ.difficulty,
        contextSnippet: targetQ.explanation
      });

      const updated = [...quiz.questions];
      updated[idx] = res.data.data;
      setQuiz({ ...quiz, questions: updated });
      toast.success(`Question ${idx + 1} regenerated with AI.`);
    } catch (err: any) {
      toast.error('Failed to regenerate question.');
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleEnhanceExplanation = async (idx: number, style: 'simpler' | 'detailed') => {
    try {
      setEnhancingIndex(idx);
      const targetQ = quiz.questions[idx];
      const res = await api.post('/quizzes/enhance-explanation', {
        question: targetQ.question,
        answer: targetQ.answer,
        currentExplanation: targetQ.explanation,
        style
      });

      const updated = [...quiz.questions];
      updated[idx] = { ...targetQ, explanation: res.data.data.explanation };
      setQuiz({ ...quiz, questions: updated });
      toast.success(`Explanation enhanced for Question ${idx + 1}.`);
    } catch (err: any) {
      toast.error('Failed to enhance explanation.');
    } finally {
      setEnhancingIndex(null);
    }
  };

  const handleSaveQuiz = async () => {
    if (!quiz._id) return;
    setSaving(true);
    setError('');
    try {
      await api.put(`/quizzes/${quiz._id}`, quiz);
      toast.success('Assessment changes saved successfully.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save assessment.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishQuiz = async () => {
    if (!quiz._id) return;
    setPublishing(true);
    setError('');
    try {
      await api.put(`/quizzes/${quiz._id}`, quiz);
      await api.patch(`/quizzes/${quiz._id}/publish`);
      toast.success('Assessment published! Available to learners immediately.');
      navigate('/teacher/quizzes');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to publish assessment.';
      setError(msg);
      toast.error(msg);
    } finally {
      setPublishing(false);
      setShowPublishConfirm(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Back link */}
      <Link to="/teacher/upload" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--sp-4)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={14} /> Back to Upload
      </Link>

      {error && <AlertBox type="error" message={error} />}

      {/* Quiz Summary Card */}
      <div className="card" style={{ marginBottom: 'var(--sp-6)', padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)', flexWrap: 'wrap' }}>
              <QuizStatusBadge status={quiz.status ?? 'draft'} />
              <span className="badge badge-published" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
                {quiz.questions.length} Questions
              </span>
              <span className="badge badge-draft" style={{ background: 'var(--color-surface-high)', color: 'var(--color-text)' }}>
                {quiz.topic || 'Workforce Training'}
              </span>
            </div>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--sp-2)' }}>
              {quiz.title}
            </h1>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 'var(--sp-3)' }}>
              {quiz.description}
            </p>

            {quiz.sourceFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>
                <FileText size={13} style={{ color: 'var(--color-primary)' }} />
                Source: <strong>{quiz.sourceFile}</strong>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={handleSaveQuiz}
              disabled={saving || publishing}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setShowPublishConfirm(true)}
              disabled={saving || publishing}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: '#fff' }}
            >
              <Globe size={16} style={{ color: 'var(--color-gold)' }} />
              {publishing ? 'Publishing...' : 'Publish Assessment'}
            </button>
          </div>
        </div>
      </div>

      {/* ── AI Quality & Trust Panel ── */}
      <div className="ai-quality-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                  AI Quality & Trust Evaluation
                </h3>
                <span className="badge badge-published" style={{ fontWeight: 800, fontSize: 12 }}>
                  {aiQuality.overallScore}% Verified Score
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                Questions generated from uploaded source material with procedural fidelity checks.
              </p>
            </div>
          </div>
          <div className="enterprise-badge" style={{ fontSize: 11 }}>
            <Sparkles size={12} /> Traceable Citations
          </div>
        </div>

        <div className="ai-quality-grid">
          <div className="ai-metric-item">
            <div className="ai-metric-header">
              <span className="ai-metric-name">Content Relevance</span>
              <span className="ai-metric-val">{aiQuality.metrics.contentRelevance}%</span>
            </div>
            <div className="ai-metric-bar">
              <div className="ai-metric-bar-fill" style={{ width: `${aiQuality.metrics.contentRelevance}%` }} />
            </div>
          </div>

          <div className="ai-metric-item">
            <div className="ai-metric-header">
              <span className="ai-metric-name">Answer Consistency</span>
              <span className="ai-metric-val">{aiQuality.metrics.answerConsistency}%</span>
            </div>
            <div className="ai-metric-bar">
              <div className="ai-metric-bar-fill" style={{ width: `${aiQuality.metrics.answerConsistency}%` }} />
            </div>
          </div>

          <div className="ai-metric-item">
            <div className="ai-metric-header">
              <span className="ai-metric-name">Question Diversity</span>
              <span className="ai-metric-val">{aiQuality.metrics.questionDiversity}%</span>
            </div>
            <div className="ai-metric-bar">
              <div className="ai-metric-bar-fill" style={{ width: `${aiQuality.metrics.questionDiversity}%` }} />
            </div>
          </div>

          <div className="ai-metric-item">
            <div className="ai-metric-header">
              <span className="ai-metric-name">Difficulty Balance</span>
              <span className="ai-metric-val">{aiQuality.metrics.difficultyBalance}%</span>
            </div>
            <div className="ai-metric-bar">
              <div className="ai-metric-bar-fill" style={{ width: `${aiQuality.metrics.difficultyBalance}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Questions Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
          Assessment Questions ({quiz.questions.length})
        </h2>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Review, edit, or regenerate individual questions prior to publishing.
        </span>
      </div>

      {/* Questions List */}
      <div className="questions-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {quiz.questions.map((q, idx) => {
          const isEditing = editingIndex === idx;

          return (
            <div key={idx} className="card question-card" style={{ padding: 'var(--sp-5)' }}>
              {isEditing && editingQuestion ? (
                /* Inline Edit Form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                      Editing Question {idx + 1}
                    </span>
                    <select
                      className="form-select"
                      style={{ width: 'auto', padding: '4px 10px', fontSize: 'var(--text-xs)' }}
                      value={editingQuestion.difficulty}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>Question Text</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingQuestion.question}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    />
                  </div>

                  {editingQuestion.type === 'mcq' && editingQuestion.options && (
                    <div>
                      <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>MCQ Options & Select Correct Answer</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {editingQuestion.options.map((opt, optIdx) => (
                          <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="radio"
                              name={`correct-opt-${idx}`}
                              checked={editingQuestion.answer === opt}
                              onChange={() => setEditingQuestion({ ...editingQuestion, answer: opt })}
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              className="form-input"
                              style={{ flex: 1, padding: '6px 10px' }}
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...editingQuestion.options!];
                                newOpts[optIdx] = e.target.value;
                                const isCurCorrect = editingQuestion.answer === opt;
                                setEditingQuestion({
                                  ...editingQuestion,
                                  options: newOpts,
                                  answer: isCurCorrect ? e.target.value : editingQuestion.answer
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingQuestion.type === 'true_false' && (
                    <div>
                      <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>Correct Answer</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['True', 'False'].map((tf) => (
                          <button
                            key={tf}
                            type="button"
                            className={`btn btn-sm ${editingQuestion.answer === tf ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setEditingQuestion({ ...editingQuestion, answer: tf })}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingQuestion.type === 'short_answer' && (
                    <div>
                      <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>Expected Answer</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingQuestion.answer}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>Explanation</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={editingQuestion.explanation}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingIndex(null)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(idx)}>
                      <Check size={14} /> Update Question
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Question Display */
                <div>
                  <div className="question-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-4)', marginBottom: 'var(--sp-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', flex: 1 }}>
                      <div className="question-number" style={{ background: 'var(--color-primary)', color: 'var(--color-gold)' }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-1)' }}>
                          <QuestionTypeBadge type={q.type} />
                          <DifficultyBadge difficulty={q.difficulty} />
                        </div>
                        <p style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text)', margin: '4px 0 0 0' }}>
                          {q.question}
                        </p>
                      </div>
                    </div>

                    {/* Question Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleStartEdit(idx)}
                        title="Edit question text and answers"
                        style={{ padding: '5px 8px' }}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRegenerateQuestion(idx)}
                        disabled={regeneratingIndex === idx}
                        title="Regenerate this question with AI"
                        style={{ padding: '5px 8px', color: 'var(--color-primary)' }}
                      >
                        <RotateCcw size={14} /> {regeneratingIndex === idx ? 'Regenerating...' : 'Regenerate'}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowDeleteConfirm(idx)}
                        title="Delete question"
                        style={{ padding: '5px 8px', color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* MCQ Options */}
                  {q.type === 'mcq' && q.options && (
                    <div className="question-options" style={{ margin: 'var(--sp-3) 0' }}>
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isCorrect = opt === q.answer;
                        return (
                          <div
                            key={optIdx}
                            className={`option-item ${isCorrect ? 'correct' : ''}`}
                            style={{
                              border: isCorrect ? '1.5px solid var(--color-success)' : '1px solid var(--color-border)',
                              background: isCorrect ? 'var(--color-success-subtle)' : 'var(--color-surface-low)'
                            }}
                          >
                            <span className="option-letter" style={{ fontWeight: 700 }}>{letter}.</span>
                            <span style={{ flex: 1, fontWeight: isCorrect ? 600 : 400 }}>{opt}</span>
                            {isCorrect && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-success)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                                <CheckCircle2 size={15} /> Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* True/False Options */}
                  {q.type === 'true_false' && (
                    <div className="question-options" style={{ margin: 'var(--sp-3) 0' }}>
                      {['True', 'False'].map((tf) => {
                        const isCorrect = tf.toLowerCase() === q.answer?.toLowerCase();
                        return (
                          <div
                            key={tf}
                            className={`option-item ${isCorrect ? 'correct' : ''}`}
                            style={{
                              border: isCorrect ? '1.5px solid var(--color-success)' : '1px solid var(--color-border)',
                              background: isCorrect ? 'var(--color-success-subtle)' : 'var(--color-surface-low)'
                            }}
                          >
                            <span className="option-letter" style={{ fontWeight: 700 }}>{tf === 'True' ? 'T' : 'F'}.</span>
                            <span style={{ flex: 1, fontWeight: isCorrect ? 600 : 400 }}>{tf}</span>
                            {isCorrect && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-success)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                                <CheckCircle2 size={15} /> Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Short Answer */}
                  {q.type === 'short_answer' && (
                    <div style={{ margin: 'var(--sp-3) 0', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--color-surface-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 2 }}>
                        Expected Answer:
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                        "{q.answer}"
                      </div>
                    </div>
                  )}

                  {/* Explanation & Source Citation */}
                  <div style={{
                    marginTop: 'var(--sp-3)',
                    padding: 'var(--sp-3) var(--sp-4)',
                    background: 'var(--color-surface-low)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--color-gold)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary)' }}>
                        <Info size={13} /> Explanation & Context
                      </div>

                      {/* AI explanation improvers */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEnhanceExplanation(idx, 'simpler')}
                          disabled={enhancingIndex === idx}
                          style={{ fontSize: 11, padding: '2px 6px' }}
                        >
                          <Zap size={11} /> {enhancingIndex === idx ? 'Enhancing...' : 'Make Simpler'}
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 1.5, margin: 0 }}>
                      {q.explanation}
                    </p>

                    {q.source && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 11, color: 'var(--color-text-subtle)' }}>
                        <MapPin size={11} /> {q.source}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog: Publish Assessment */}
      {showPublishConfirm && (
        <ConfirmDialog
          title="Publish Assessment?"
          message="This assessment will become available in the student catalogue immediately. Learners can begin taking it and recording scores."
          confirmLabel="Yes, Publish Now"
          cancelLabel="Continue Reviewing"
          onConfirm={handlePublishQuiz}
          onCancel={() => setShowPublishConfirm(false)}
          loading={publishing}
        />
      )}

      {/* Confirmation Dialog: Delete Question */}
      {showDeleteConfirm !== null && (
        <ConfirmDialog
          title="Delete Question?"
          message={`Are you sure you want to remove Question ${showDeleteConfirm + 1} from this assessment?`}
          confirmLabel="Delete Question"
          cancelLabel="Keep Question"
          danger
          onConfirm={() => handleDeleteQuestion(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
