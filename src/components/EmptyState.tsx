import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState = ({ title, description, icon, action }: Props) => (
  <div className="card animate-scale-in flex flex-col items-center justify-center gap-5 overflow-hidden p-14 text-center">
    <div className="relative">
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-wine-500/15 blur-3xl animate-pulse-soft" />
      {icon ? (
        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.08] bg-ink-850 text-cream-400 shadow-glow">
          {icon}
        </div>
      ) : (
        <CrescentArt />
      )}
    </div>
    <div>
      <div className="display text-2xl text-ink-100 sm:text-3xl text-balance">{title}</div>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-400">{description}</p>
      )}
    </div>
    {action}
  </div>
);

const CrescentArt = () => (
  <svg viewBox="0 0 80 80" className="h-16 w-16" aria-hidden>
    <defs>
      <radialGradient id="moon" cx="38%" cy="34%" r="68%">
        <stop offset="0%" stopColor="#F0E4CD" />
        <stop offset="55%" stopColor="#8C3A52" />
        <stop offset="100%" stopColor="#13080F" />
      </radialGradient>
    </defs>
    <circle cx="40" cy="40" r="22" fill="url(#moon)" />
    <circle cx="50" cy="32" r="18" fill="#0E0B10" />
    <circle cx="40" cy="40" r="22" fill="none" stroke="rgba(232,212,184,0.18)" strokeWidth="0.5" />
  </svg>
);
