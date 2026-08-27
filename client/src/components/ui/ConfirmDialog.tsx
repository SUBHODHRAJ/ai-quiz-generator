import { X, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  loading?: boolean;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <div
      className="confirm-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="confirm-dialog" role="dialog" aria-modal="true">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--sp-4)",
            marginBottom: "var(--sp-5)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-lg, 12px)",
              background: danger
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(255, 181, 0, 0.15)",
              border: `1px solid ${
                danger ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 181, 0, 0.3)"
              }`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: danger ? "#ef4444" : "var(--color-primary, #FFB500)",
              flexShrink: 0,
            }}
          >
            {danger ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
          </div>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: 700,
                color: "var(--color-text, #FFF8ED)",
                margin: "0 0 6px 0",
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted, #BCAAA4)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            style={{
              color: "var(--color-text-muted)",
              cursor: "pointer",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--radius-md)",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              transition: "background 0.2s, color 0.2s",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "var(--sp-3)",
            justifyContent: "flex-end",
            alignItems: "center",
            flexWrap: "wrap",
            paddingTop: "var(--sp-4)",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={onCancel}
            disabled={loading}
            style={{ minHeight: 40, padding: "0 18px", fontWeight: 600 }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? "btn-danger" : "btn-primary"} btn-md`}
            onClick={onConfirm}
            disabled={loading}
            style={{
              minHeight: 40,
              padding: "0 20px",
              fontWeight: 600,
              background: danger ? "#ef4444" : "var(--color-primary, #FFB500)",
              color: danger ? "#ffffff" : "#351C15",
              boxShadow: danger ? "none" : "0 2px 8px rgba(255, 181, 0, 0.25)",
            }}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AlertBoxProps {
  type: "error" | "success" | "warning";
  message: string;
}

export function AlertBox({ type, message }: AlertBoxProps) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
    </div>
  );
}
