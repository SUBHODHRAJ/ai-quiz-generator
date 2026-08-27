import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserRound,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { UserRole } from '../types';
import { AlertBox } from '../components/ui/ConfirmDialog';

const passwordRules = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains a letter',      test: (p: string) => /[a-zA-Z]/.test(p) },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ name, email, password, role });
      toast.success('Account created successfully.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message || 'Unable to create account. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── Left Branding Panel ── */}
      <div className="auth-left" style={{
        background: 'linear-gradient(145deg, #24100C 0%, #351C15 50%, #1A0B08 100%)',
        color: '#FFF8ED'
      }}>
        <div className="auth-left-bg">
          <div className="auth-left-glow" style={{ background: 'radial-gradient(circle, rgba(255,181,0,0.15) 0%, transparent 70%)' }} />
          <div className="auth-left-glow-2" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)' }} />
        </div>

        <div className="auth-brand">
          <img
            src="/ups-logo-0.webp"
            alt="UPS Logo"
            style={{
              width: 44,
              height: 44,
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
          <div>
            <div className="auth-brand-name" style={{ color: '#FFF8ED' }}>QuizMind</div>
            <div className="auth-tagline" style={{ color: 'rgba(255,248,237,0.7)' }}>Intelligent assessments. Better learning.</div>
          </div>
        </div>

        <div className="auth-left-hero">
          <div className="enterprise-badge" style={{ alignSelf: 'flex-start', marginBottom: 'var(--sp-4)', background: 'rgba(255, 181, 0, 0.15)', color: 'var(--color-gold)', borderColor: 'rgba(255,181,0,0.3)' }}>
            <Building2 size={12} /> Enterprise Assessment Infrastructure
          </div>

          <h1 className="auth-hero-heading" style={{ color: '#FFF8ED' }}>
            Build intelligent workforce assessments with AI.
          </h1>
          <p className="auth-hero-subtext" style={{ color: 'rgba(255,248,237,0.8)' }}>
            Empower educators and training directors to evaluate competence, measure learning progress, and verify procedural understanding.
          </p>

          <div className="auth-features">
            {[
              { icon: <GraduationCap size={18} />, title: 'For Trainers & Educators', desc: 'Create AI-assisted assessments from your documentation' },
              { icon: <BookOpen size={18} />, title: 'For Learners & Trainees', desc: 'Interactive testing with immediate conceptual feedback' },
              { icon: <ShieldCheck size={18} />, title: 'Built for Enterprise Reliability', desc: 'Strict data isolation and verifiable grading standards' },
            ].map((f, i) => (
              <div className="auth-feature-item" key={i}>
                <div className="auth-feature-icon" style={{ background: 'rgba(255,181,0,0.12)', borderColor: 'rgba(255,181,0,0.3)', color: 'var(--color-gold)' }}>
                  {f.icon}
                </div>
                <div className="auth-feature-text">
                  <strong style={{ color: '#FFF8ED' }}>{f.title}</strong>
                  <span style={{ color: 'rgba(255,248,237,0.7)' }}>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card-heading">Create Account</h2>
          <p className="auth-card-subtext">Set up your QuizMind workspace profile.</p>

          <AlertBox type="error" message={error} />

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><UserRound size={16} /></span>
                <input
                  id="name"
                  type="text"
                  className="form-input has-icon-left"
                  placeholder="e.g. Marcus Vance"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Work / Personal Email</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><Mail size={16} /></span>
                <input
                  id="reg-email"
                  type="email"
                  className="form-input has-icon-left"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><Lock size={16} /></span>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-icon-left has-icon-right"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="password-hint" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                  {passwordRules.map(rule => (
                    <span
                      key={rule.label}
                      style={{
                        color: rule.test(password) ? 'var(--color-success)' : 'var(--color-text-muted)',
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 'var(--text-xs)'
                      }}
                    >
                      <CheckCircle2 size={12} />
                      {rule.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Account type */}
            <div className="form-group">
              <label className="form-label">Platform Role</label>
              <div className="role-cards">
                <button
                  type="button"
                  id="role-student"
                  className={`role-card ${role === 'STUDENT' ? 'selected' : ''}`}
                  onClick={() => setRole('STUDENT')}
                >
                  <div className="role-card-icon"><BookOpen size={20} /></div>
                  <div className="role-card-title">Learner / Student</div>
                  <div className="role-card-desc">Take tests & track progress</div>
                </button>

                <button
                  type="button"
                  id="role-teacher"
                  className={`role-card ${role === 'TEACHER' ? 'selected' : ''}`}
                  onClick={() => setRole('TEACHER')}
                >
                  <div className="role-card-icon"><GraduationCap size={20} /></div>
                  <div className="role-card-title">Trainer / Teacher</div>
                  <div className="role-card-desc">Create & publish assessments</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="register-submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 'var(--sp-2)' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner spinner-sm" />
                  Setting up account...
                </>
              ) : (
                'Create Account & Enter'
              )}
            </button>
          </form>

          <p style={{
            marginTop: 'var(--sp-6)',
            textAlign: 'center',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
