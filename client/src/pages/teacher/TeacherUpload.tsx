import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Sparkles,
  X,
  BookOpen,
  CheckSquare,
  MessageSquare,
  ArrowRight,
  Workflow,
} from 'lucide-react';
import api from '../../services/api';
import type { Quiz } from '../../types/quiz';
import type { QuestionType } from '../../types/quiz';
import { AlertBox } from '../../components/ui/ConfirmDialog';

const GENERATION_STAGES = [
  'Analyzing your material...',
  'Identifying key concepts...',
  'Generating questions...',
  'Reviewing answers...',
  'Preparing your quiz...',
];

interface QuestionTypeOption {
  value: QuestionType;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

const questionTypeOptions: QuestionTypeOption[] = [
  { value: 'mcq',          label: 'Multiple Choice', desc: '4 options, one correct', icon: <BookOpen size={16} /> },
  { value: 'true_false',   label: 'True / False',    desc: 'Binary answer',           icon: <CheckSquare size={16} /> },
  { value: 'short_answer', label: 'Short Answer',    desc: 'Open text response',      icon: <MessageSquare size={16} /> },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function TeacherUpload() {
  const navigate = useNavigate();

  const [file, setFile]                       = useState<File | null>(null);
  const [dragOver, setDragOver]               = useState(false);
  const [questionCount, setQuestionCount]     = useState(10);
  const [difficulty, setDifficulty]           = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionTypes, setQuestionTypes]     = useState<QuestionType[]>(['mcq']);
  const [loading, setLoading]                 = useState(false);
  const [stageIndex, setStageIndex]           = useState(0);
  const [error, setError]                     = useState('');
  const fileInputRef                          = useRef<HTMLInputElement>(null);
  const stageIntervalRef                      = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleType = (type: QuestionType) => {
    setQuestionTypes(prev =>
      prev.includes(type)
        ? prev.length === 1 ? prev : prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }
    setFile(f);
    setError('');
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  const startStageLoop = () => {
    let i = 0;
    stageIntervalRef.current = setInterval(() => {
      i = (i + 1) % GENERATION_STAGES.length;
      setStageIndex(i);
    }, 2200);
  };

  const stopStageLoop = () => {
    if (stageIntervalRef.current) {
      clearInterval(stageIntervalRef.current);
      stageIntervalRef.current = null;
    }
  };

  async function generateQuiz() {
    if (!file) { setError('Please select a document first.'); return; }
    if (!(file instanceof File)) {
      setError('Please select a valid document file.');
      return;
    }
    if (questionTypes.length === 0) { setError('Select at least one question type.'); return; }

    console.log("Quiz generation request");
    console.log("API base URL:", api.defaults.baseURL);
    console.log("Endpoint:", "/quizzes/generate");
    console.log("File:", file?.name);
    console.log("Uploading file:", file);
    console.log("File name:", file?.name);
    console.log("File type:", file?.type);
    console.log("File size:", file?.size);

    setLoading(true);
    setError('');
    setStageIndex(0);
    startStageLoop();

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('questionCount', String(questionCount));
      formData.append('difficulty', difficulty);
      formData.append('questionTypes', questionTypes.join(','));

      const response = await api.post<{ success: boolean; message: string; data: Quiz }>('/quizzes/generate', formData, {
        timeout: 180000,
      });

      const quiz: Quiz = response.data.data;
      // Navigate to review page with quiz data
      navigate('/teacher/quizzes/review', { state: { quiz } });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Quiz generation failed. Please try again.');
    } finally {
      stopStageLoop();
      setLoading(false);
    }
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-eyebrow">
          <Sparkles size={14} />
          AI Quiz Generator
        </div>
        <h1 className="page-title">Create a new quiz</h1>
        <p className="page-subtitle">Upload your study material and let AI create a quiz.</p>
      </div>

      <AlertBox type="error" message={error} />

      {loading ? (
        /* Generation Progress */
        <div className="card" style={{ marginTop: 'var(--sp-4)' }}>
          <div className="generation-progress">
            <div className="generation-spinner" />
            <div>
              <div className="generation-stage">{GENERATION_STAGES[stageIndex]}</div>
              <div className="generation-hint" style={{ marginTop: 8 }}>
                This may take up to 60 seconds depending on document size.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="quiz-workspace">
          {/* ── Upload Area ── */}
          <div>
            {/* Enterprise training flow context */}
            <div style={{
              background: 'var(--color-surface-mid)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--sp-4) var(--sp-5)',
              marginBottom: 'var(--sp-4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                  <Workflow size={13} />
                  From training document → assessment
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)' }}>
                  Workforce training workflow
                </span>
              </div>

              {/* Step pipeline */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--sp-2)',
                padding: 'var(--sp-2) 0 var(--sp-3)',
                borderBottom: '1px solid var(--color-border)',
                flexWrap: 'wrap',
              }}>
                {[
                  'Training Material',
                  'AI Analysis',
                  'Smart Questions',
                  'Employee Assessment'
                ].map((step, idx, arr) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: idx === 0 ? 'var(--color-text)' : idx === 3 ? 'var(--color-success)' : 'var(--color-text-muted)',
                      background: 'var(--color-surface-high)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                    }}>
                      {step}
                    </span>
                    {idx < arr.length - 1 && (
                      <ArrowRight size={12} style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Example docs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap', marginTop: 'var(--sp-2)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)', fontWeight: 500 }}>
                  Examples:
                </span>
                {[
                  'Safety Manual',
                  'SOP Document',
                  'Employee Handbook',
                  'Operations Guide'
                ].map(ex => (
                  <span
                    key={ex}
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      padding: '2px 8px',
                    }}
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)', color: 'var(--color-text)' }}>
                Document
              </h2>

              <label
                htmlFor="document-input"
                className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  id="document-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />

                {file ? (
                  <>
                    <FileText size={40} className="upload-icon" />
                    <div>
                      <div className="upload-title">{file.name}</div>
                      <div className="upload-subtitle">{formatBytes(file.size)}</div>
                    </div>
                    <span className="badge badge-published">File selected</span>
                  </>
                ) : (
                  <>
                    <Upload size={40} className="upload-icon" />
                    <div>
                      <div className="upload-title">Drag & drop your file here</div>
                      <div className="upload-subtitle">PDF, DOCX, TXT or Markdown — max 10 MB</div>
                    </div>
                    <span className="upload-browse">Browse files →</span>
                  </>
                )}
              </label>

              {file && (
                <button
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 'var(--sp-3)', color: 'var(--color-danger)' }}
                >
                  <X size={14} /> Remove file
                </button>
              )}
            </div>
          </div>

          {/* ── Settings Panel ── */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-6)', color: 'var(--color-text)' }}>
              Quiz Settings
            </h2>

            {/* Question Count */}
            <div className="form-group">
              <label className="form-label" htmlFor="question-count">Number of questions</label>
              <select
                id="question-count"
                className="form-select"
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
              >
                {[5, 10, 15, 20, 25, 30, 40, 50].map(n => (
                  <option key={n} value={n}>{n} questions</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    id={`diff-${d}`}
                    className={`type-chip ${difficulty === d ? 'selected' : ''}`}
                    onClick={() => setDifficulty(d)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div className="form-group">
              <label className="form-label">Question types</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {questionTypeOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`type-${opt.value}`}
                    className={`type-chip ${questionTypes.includes(opt.value) ? 'selected' : ''}`}
                    onClick={() => toggleType(opt.value)}
                    style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
                  >
                    {opt.icon}
                    <span style={{ flex: 1, textAlign: 'left' }}>{opt.label}</span>
                    {questionTypes.includes(opt.value) && (
                      <span style={{ color: 'var(--color-primary)', fontSize: 10 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="divider" />

            <button
              id="generate-quiz-btn"
              className="btn btn-ai btn-full btn-lg"
              onClick={generateQuiz}
              disabled={!file || loading}
            >
              <Sparkles size={18} />
              Generate Quiz
            </button>

            {!file && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', textAlign: 'center', marginTop: 'var(--sp-3)' }}>
                Upload a document to enable generation
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
