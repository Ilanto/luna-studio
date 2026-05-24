import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import { cx } from "../utils/cx";

interface Toast {
  id: number;
  message: string;
  tone: "default" | "success" | "danger";
}

interface ToastContextValue {
  push: (message: string, tone?: Toast["tone"]) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS = {
  default: Info,
  success: Check,
  danger: AlertTriangle,
} as const;

const TONE_STYLES = {
  default:
    "border-white/[0.07] bg-ink-850/85 text-ink-100 shadow-raised [&_.toast-icon]:text-plum-300 [&_.toast-icon-bg]:bg-plum-500/15 [&_.toast-icon-bg]:border-plum-400/25",
  success:
    "border-wine-400/35 bg-wine-700/40 text-cream-300 shadow-wine-glow [&_.toast-icon]:text-cream-400 [&_.toast-icon-bg]:bg-cream-400/15 [&_.toast-icon-bg]:border-cream-400/30",
  danger:
    "border-red-500/35 bg-red-950/70 text-red-50 shadow-raised [&_.toast-icon]:text-red-300 [&_.toast-icon-bg]:bg-red-500/15 [&_.toast-icon-bg]:border-red-500/30",
} as const;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, tone: Toast["tone"] = "default") => {
      const id = Date.now() + Math.random();
      setToasts((ts) => [...ts, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), tone === "danger" ? 4000 : 2800);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push, toasts }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2.5 px-4 md:bottom-8">
        {toasts.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <button
              key={t.id}
              onClick={() => dismiss(t.id)}
              className={cx(
                "group pointer-events-auto flex min-w-[260px] max-w-md animate-toast-in items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium backdrop-blur-2xl transition hover:brightness-110",
                TONE_STYLES[t.tone]
              )}
            >
              <span className="toast-icon-bg grid h-7 w-7 shrink-0 place-items-center rounded-lg border">
                <Icon size={14} strokeWidth={2} className="toast-icon" />
              </span>
              <span className="flex-1 text-left leading-snug">{t.message}</span>
              <X
                size={13}
                className="shrink-0 text-ink-400 opacity-0 transition group-hover:opacity-100"
                strokeWidth={2}
              />
            </button>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};
