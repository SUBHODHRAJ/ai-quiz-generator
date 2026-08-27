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
  Cpu
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { Quiz, QuestionType } from '../../types/quiz';
import { AlertBox } from '../../components/ui/ConfirmDialog';

const GENERATION_STAGES = [
  '1/6: Reading document and parsing text content...',
  '2/6: Extracting knowledge and identifying key concepts...',
  '3/6: Generating procedure and compliance questions...',
  '4/6: Cross-verifying correct answers against source material...',
  '5/6: Constructing detailed conceptual explanations...',
  '6/6: Preparing assessment and computing quality scores...',
];

interface QuestionTypeOption {
  value: QuestionType;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

const questionTypeOptions: QuestionTypeOption[] = [
  { value: 'mcq',          label: 'Multiple Choice (MCQ)', desc: '4 options, 1 verified answer', icon: <BookOpen size={16} /> },
  { value: 'true_false',   label: 'True / False',           desc: 'Binary procedure check',        icon: <CheckSquare size={16} /> },
  { value: 'short_answer', label: 'Short Answer',           desc: 'Open text term validation',     icon: <MessageSquare size={16} /> },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function TeacherUpload() {
  const navigate = useNavigate();
  const toast = useToast();

  const [file, setFile]                       = useState<File | null>(null);
  const [dragOver, setDragOver]               = useState(false);
  const [questionCount, setQuestionCount]     = useState(10);
  const [difficulty, setDifficulty]           = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionTypes, setQuestionTypes]     = useState<QuestionType[]>(['mcq', 'true_false', 'short_answer']);
  const [instructions, setInstructions]       = useState('');
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
    const validExts = ['.pdf', '.docx', '.txt', '.md'];
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(ext)) {
      setError('Please upload a PDF, DOCX, TXT, or MD file.');
      return;
    }
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
    }, 2800);
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
      if (instructions.trim()) {
        formData.append('instructions', instructions.trim());
      }

      const response = await api.post<{ success: boolean; message: string; data: Quiz & { aiQuality?: any } }>('/quizzes/generate', formData, {
        timeout: 180000,
      });

      const quizData = response.data.data;
      toast.success('Assessment generated successfully with AI quality verification.');
      navigate('/teacher/quizzes/review', { state: { quiz: quizData } });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Quiz generation failed. Please check server AI keys and try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      stopStageLoop();
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-eyebrow">
          <Sparkles size={14} /> AI Assessment Builder
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 className="page-title">Generate Intelligent Assessment</h1>
            <p className="page-subtitle">
              Upload enterprise training documentation, manuals, or SOPs to generate verifiable questions.
            </p>
          </div>
          <div className="enterprise-badge">
            <Cpu size={14} /> Neural Generation Engine
          </div>
        </div>
      </div>

      <AlertBox type="error" message={error} />

      {loading ? (
        /* Rich Multi-Stage Generation Progress */
        <div className="card" style={{ padding: 'var(--sp-12) var(--sp-8)', textAlign: 'center', margin: 'var(--sp-6) 0' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-primary-subtle)',
            border: '2px solid var(--color-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--sp-6)',
            color: 'var(--color-primary)',
            animation: 'spin 3s linear infinite'
          }}>
            <Sparkles size={32} />
          </div>

          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--sp-2)' }}>
            Synthesizing Assessment Material
          </h2>

          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary)', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>
            {GENERATION_STAGES[stageIndex]}
          </p>

          <div style={{
            maxWidth: 460,
            margin: '0 auto',
            height: 8,
            background: 'var(--color-surface-high)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${((stageIndex + 1) / GENERATION_STAGES.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-gold))',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.8s ease'
            }} />
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--sp-4)' }}>
            Applying deterministic quality scoring, answer consistency checks, and concept extraction.
          </p>
        </div>
      ) : (
        <div className="quiz-workspace">
          {/* ── Left Column: Upload & Instructions ── */}
          <div>
            {/* Enterprise Training Workflow Banner */}
            <div style={{
              background: 'var(--color-surface-low)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--sp-4) var(--sp-5)',
              marginBottom: 'var(--sp-4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                  <Workflow size={13} />
                  Enterprise Assessment Pipeline
                </div>
                <span className="enterprise-badge" style={{ fontSize: 10, padding: '2px 8px' }}>
                  Reliable & Traceable
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
                  'Training Document',
                  'AI Analysis',
                  'Smart Questions',
                  'Workforce Readiness'
                ].map((step, idx, arr) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: idx === 0 ? 'var(--color-text)' : idx === 3 ? 'var(--color-success)' : 'var(--color-text-muted)',
                      background: 'var(--color-surface)',
                      padding: '4px 10px',
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

              {/* Example files */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap', marginTop: 'var(--sp-2)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
                  Supported Documents:
                </span>
                {[
                  'Safety Compliance Manual',
                  'Standard Operating Procedures (SOP)',
                  'Equipment Diagnostic Guide',
                  'Onboarding Handbook'
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

            {/* Document Dropzone */}
            <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-4)' }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)', color: 'var(--color-text)' }}>
                Source Training Material
              </h2>

              <label
                htmlFor="document-input"
                className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed var(--color-border-strong)',
                  background: file ? 'var(--color-surface-low)' : 'var(--color-surface)',
                  cursor: 'pointer'
                }}
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
                    <FileText size={42} style={{ color: 'var(--color-primary)' }} />
                    <div>
                      <div className="upload-title" style={{ fontWeight: 700 }}>{file.name}</div>
                      <div className="upload-subtitle">{formatBytes(file.size)} • Ready for AI parsing</div>
                    </div>
                    <span className="badge badge-published">File Selected</span>
                  </>
                ) : (
                  <>
                    <Upload size={42} style={{ color: 'var(--color-primary)' }} />
                    <div>
                      <div className="upload-title" style={{ fontWeight: 700 }}>Drop your learning material here</div>
                      <div className="upload-subtitle">PDF, DOCX, TXT, or MD • Maximum 10 MB</div>
                    </div>
                    <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                      Browse Files
                    </span>
                  </>
                )}
              </label>

              {file && (
                <button
                  type="button"
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 'var(--sp-3)', color: 'var(--color-danger)' }}
                >
                  <X size={14} /> Remove Selected File
                </button>
              )}
            </div>

            {/* Custom AI Instructions */}
            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                <label className="form-label" htmlFor="instructions" style={{ margin: 0, fontWeight: 700 }}>
                  Custom AI Focus & Instructions (Optional)
                </label>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Tailor questions</span>
              </div>
              <textarea
                id="instructions"
                className="form-input"
                rows={3}
                placeholder="e.g. Focus on procedural steps, compliance thresholds, and practical warehouse scenarios..."
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* ── Right Column: Configuration & Actions ── */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-6)', color: 'var(--color-text)' }}>
              Assessment Configuration
            </h2>

            {/* Question Count */}
            <div className="form-group">
              <label className="form-label" htmlFor="question-count">Question Count</label>
              <select
                id="question-count"
                className="form-select"
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
              >
                {[5, 10, 15, 20, 25, 30, 40, 50].map(n => (
                  <option key={n} value={n}>{n} Questions</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="form-group">
              <label className="form-label">Difficulty Target</label>
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    id={`diff-${d}`}
                    className={`type-chip ${difficulty === d ? 'selected' : ''}`}
                    onClick={() => setDifficulty(d)}
                    style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div className="form-group">
              <label className="form-label">Allowed Question Formats</label>
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
                    <div style={{ flex: 1, textAlign: 'left', marginLeft: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                    </div>
                    {questionTypes.includes(opt.value) && (
                      <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ margin: 'var(--sp-6) 0', borderTop: '1px solid var(--color-border)' }} />

            <button
              id="generate-quiz-btn"
              className="btn btn-primary btn-full btn-lg"
              onClick={generateQuiz}
              disabled={!file || loading}
              style={{ background: 'var(--color-primary)', color: '#fff', boxShadow: 'var(--shadow-md)' }}
            >
              <Sparkles size={18} style={{ color: 'var(--color-gold)' }} />
              Generate Intelligent Quiz
            </button>

            {!file && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--sp-3)' }}>
                Please select or drop a training file to begin.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
