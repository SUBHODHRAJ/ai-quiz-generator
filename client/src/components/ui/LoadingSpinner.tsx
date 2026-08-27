interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ size = 'md', text, fullPage }: LoadingSpinnerProps) {
  const cls = `spinner spinner-${size}`;

  if (fullPage) {
    return (
      <div className="loading-screen">
        <div className={cls} />
        {text && <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{text}</p>}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
      <div className={cls} />
      {text && <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{text}</p>}
    </div>
  );
}
