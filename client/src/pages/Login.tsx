import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AlertBox } from '../components/ui/ConfirmDialog';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

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
      const loggedInUser = await login(email, password);
      toast.success('Signed in successfully.');
      navigate(loggedInUser.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message || 'Unable to sign in. Please verify your credentials.';
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

        {/* Brand */}
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

        {/* Hero */}
        <div className="auth-left-hero">
          <div className="enterprise-badge" style={{ alignSelf: 'flex-start', marginBottom: 'var(--sp-4)', background: 'rgba(255, 181, 0, 0.15)', color: 'var(--color-gold)', borderColor: 'rgba(255,181,0,0.3)' }}>
            <Sparkles size={12} /> Enterprise Workforce Learning
          </div>

          <h1 className="auth-hero-heading" style={{ color: '#FFF8ED' }}>
            Turn knowledge into intelligent assessments.
          </h1>
          <p className="auth-hero-subtext" style={{ color: 'rgba(255,248,237,0.8)' }}>
            Generate verifiable evaluations directly from standard operating procedures, manuals, and enterprise training materials with AI.
          </p>

          <div className="auth-features">
            {[
              {
                icon: <Sparkles size={18} />,
                title: 'AI-Powered Quiz Generation',
                desc: 'Extract concepts and construct multi-format practice questions in seconds.'
              },
              {
                icon: <ShieldCheck size={18} />,
                title: 'Evidence-Based Questions',
                desc: 'Traceable citations with verified explanations directly from source files.'
              },
              {
                icon: <BarChart3 size={18} />,
                title: 'Intelligent Learning Analytics',
                desc: 'Measure comprehension, concept gaps, and workforce training readiness.'
              },
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
          <h2 className="auth-card-heading">Sign In to QuizMind</h2>
          <p className="auth-card-subtext">Access your training dashboard and assessments.</p>

          <AlertBox type="error" message={error} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><Mail size={16} /></span>
                <input
                  id="email"
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

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><Lock size={16} /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-icon-left has-icon-right"
                  placeholder="Enter password"
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
              style={{ marginTop: 'var(--sp-3)' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner spinner-sm" />
                  Signing in...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <p style={{
            marginTop: 'var(--sp-6)',
            textAlign: 'center',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
