import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserRound,
  GraduationCap,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { AlertBox } from '../components/ui/ConfirmDialog';

const passwordRules = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains a letter',      test: (p: string) => /[a-zA-Z]/.test(p) },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

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
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Unable to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── Left Branding Panel ── */}
      <div className="auth-left">
        <div className="auth-left-bg">
          <div className="auth-left-glow" />
          <div className="auth-left-glow-2" />
        </div>

        <svg className="auth-neural-grid" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 8 }).map((_, i) =>
            Array.from({ length: 6 }).map((_, j) => (
              <circle key={`${i}-${j}`} cx={i * 60} cy={j * 60} r="2" fill="white" />
            ))
          ).flat()}
          {Array.from({ length: 7 }).map((_, i) =>
            Array.from({ length: 5 }).map((_, j) => (
              <line key={`h-${i}-${j}`} x1={i * 60} y1={j * 60} x2={(i + 1) * 60} y2={j * 60} stroke="white" strokeWidth="0.5" />
            ))
          ).flat()}
        </svg>

        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Brain size={22} />
          </div>
          <div>
            <div className="auth-brand-name">QuizMind</div>
            <div className="auth-tagline">AI-powered learning</div>
          </div>
        </div>

        <div className="auth-left-hero">
          <h1 className="auth-hero-heading">
            Start building a smarter learning habit
          </h1>
          <p className="auth-hero-subtext">
            Join thousands of educators and students using AI to create and take
            intelligent quizzes. Set up your account in under 60 seconds.
          </p>

          <div className="auth-features">
            {[
              { icon: <GraduationCap size={18} />, title: 'For Teachers',  desc: 'Create AI-powered quizzes from your documents' },
              { icon: <BookOpen size={18} />,       title: 'For Students',  desc: 'Take quizzes and get instant explanations' },
              { icon: <CheckCircle2 size={18} />,   title: 'Free to start', desc: 'No credit card required' },
            ].map((f, i) => (
              <div className="auth-feature-item" key={i}>
                <div className="auth-feature-icon">{f.icon}</div>
                <div className="auth-feature-text">
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card-heading">Create your account</h2>
          <p className="auth-card-subtext">Get started for free — no credit card required.</p>

          <AlertBox type="error" message={error} />

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full name</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><UserRound size={16} /></span>
                <input
                  id="name"
                  type="text"
                  className="form-input has-icon-left"
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><Mail size={16} /></span>
                <input
                  id="reg-email"
                  type="email"
                  className="form-input has-icon-left"
                  placeholder="you@example.com"
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
                <div className="password-hint" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {passwordRules.map(rule => (
                    <span
                      key={rule.label}
                      style={{
                        color: rule.test(password) ? 'var(--color-success)' : 'var(--color-text-muted)',
                        display: 'flex', alignItems: 'center', gap: 6,
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
              <label className="form-label">Account type</label>
              <div className="role-cards">
                <button
                  type="button"
                  id="role-student"
                  className={`role-card ${role === 'STUDENT' ? 'selected' : ''}`}
                  onClick={() => setRole('STUDENT')}
                >
                  <div className="role-card-icon"><BookOpen size={20} /></div>
                  <div className="role-card-title">Student</div>
                  <div className="role-card-desc">Take quizzes and learn</div>
                </button>

                <button
                  type="button"
                  id="role-teacher"
                  className={`role-card ${role === 'TEACHER' ? 'selected' : ''}`}
                  onClick={() => setRole('TEACHER')}
                >
                  <div className="role-card-icon"><GraduationCap size={20} /></div>
                  <div className="role-card-title">Teacher</div>
                  <div className="role-card-desc">Create and manage quizzes</div>
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
                  Creating account...
                </>
              ) : (
                'Create account'
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
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
