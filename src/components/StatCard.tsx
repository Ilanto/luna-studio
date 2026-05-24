import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  Icon?: LucideIcon;
  tone?: "default" | "wine" | "cream";
}

const TONES = {
  default: {
    bg: "from-plum-500/12 via-ink-850 to-ink-900",
    accent: "text-plum-300",
    border: "border-plum-400/15",
    glowColor: "bg-plum-400/15",
  },
  wine: {
    bg: "from-wine-500/25 via-ink-850 to-ink-900",
    accent: "text-wine-200",
    border: "border-wine-400/25",
    glowColor: "bg-wine-400/25",
  },
  cream: {
    bg: "from-cream-500/12 via-ink-850 to-ink-900",
    accent: "text-cream-400",
    border: "border-cream-400/20",
    glowColor: "bg-cream-400/15",
  },
} as const;

export const StatCard = ({ label, value, hint, Icon, tone = "default" }: Props) => {
  const t = TONES[tone];
  return (
    <div className={`card card-hover relative overflow-hidden bg-gradient-to-br ${t.bg} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10.5px] uppercase tracking-[0.22em] text-ink-400">{label}</div>
          <div className="display mt-2.5 text-[44px] leading-none text-ink-100" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 380" }}>
            {value}
          </div>
          {hint && <div className="mt-2 text-xs text-ink-400">{hint}</div>}
        </div>
        {Icon && (
          <div className={`grid h-10 w-10 place-items-center rounded-xl border ${t.border} bg-ink-950/40 ${t.accent}`}>
            <Icon size={16} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className={`pointer-events-none absolute -right-14 -bottom-14 h-36 w-36 rounded-full ${t.glowColor} opacity-50 blur-3xl`} />
    </div>
  );
};
