import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon}
      </div>
      <div>
        <p className="empty-state-title">{title}</p>
        <p className="empty-state-text">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
