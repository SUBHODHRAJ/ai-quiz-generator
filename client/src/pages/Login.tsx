import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Workflow,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AlertBox } from '../components/ui/ConfirmDialog';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Unable to login. Please try again.');
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

        {/* Neural grid decoration */}
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
          {Array.from({ length: 8 }).map((_, i) =>
            Array.from({ length: 5 }).map((_, j) => (
              <line key={`v-${i}-${j}`} x1={i * 60} y1={j * 60} x2={i * 60} y2={(j + 1) * 60} stroke="white" strokeWidth="0.5" />
            ))
          ).flat()}
        </svg>

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Brain size={22} />
          </div>
          <div>
            <div className="auth-brand-name">QuizMind</div>
            <div className="auth-tagline">AI-powered learning</div>
          </div>
        </div>

        {/* Hero */}
        <div className="auth-left-hero">
          <h1 className="auth-hero-heading">
            One platform for smarter learning
          </h1>
          <p className="auth-hero-subtext">
            Transform training content into engaging assessments with AI. Built for enterprise teams, educators, and workforce learning.
          </p>

          <div className="auth-features">
            {[
              { icon: <Sparkles size={18} />, title: 'AI-generated assessments', desc: 'Instant questions with verified answers' },
              { icon: <Workflow size={18} />, title: 'Enterprise training workflows', desc: 'Convert SOPs, manuals & handbooks' },
              { icon: <ShieldCheck size={18} />, title: 'Knowledge verification', desc: 'Measure comprehension and compliance' },
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
          <h2 className="auth-card-heading">Welcome back</h2>
          <p className="auth-card-subtext">Sign in to continue your learning journey.</p>

          <AlertBox type="error" message={error} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><Mail size={16} /></span>
                <input
                  id="email"
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

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><Lock size={16} /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-icon-left has-icon-right"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              id="login-submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 'var(--sp-2)' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner spinner-sm" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p style={{
            marginTop: 'var(--sp-6)',
            textAlign: 'center',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}>
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
