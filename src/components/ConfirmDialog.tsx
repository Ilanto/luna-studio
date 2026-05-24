import { useEffect } from "react";

interface Props {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  danger,
  onConfirm,
  onCancel,
}: Props) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-black/65 backdrop-blur-md"
        onClick={onCancel}
      />
      <div className="card-raised relative z-10 w-full max-w-md animate-scale-in overflow-hidden p-7">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-wine-500/25 blur-3xl" />
        <div className="relative">
          <div className="display text-2xl leading-tight text-ink-100 text-balance">{title}</div>
          {message && (
            <p className="mt-3 text-sm leading-relaxed text-ink-400">{message}</p>
          )}
          <div className="mt-7 flex justify-end gap-2">
            <button onClick={onCancel} className="btn">
              {cancelLabel}
            </button>
            <button onClick={onConfirm} className={danger ? "btn-danger" : "btn-primary"}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
