import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--sp-8)'
    }}>
      <div className="card" style={{
        maxWidth: 500,
        textAlign: 'center',
        padding: 'var(--sp-10)',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'var(--color-primary-subtle)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--sp-4)'
        }}>
          <HelpCircle size={32} />
        </div>

        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px 0' }}>
          404
        </h1>

        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 var(--sp-2) 0' }}>
          Page Not Found
        </h2>

        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-6)', lineHeight: 1.6 }}>
          The page or assessment route you requested does not exist or has been moved.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost btn-md"
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            className="btn btn-primary btn-md"
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Home size={16} /> Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
