import { cx } from "../utils/cx";

interface Props {
  label: string;
  value: number; // 0-5
  tone?: "default" | "cream" | "wine";
  className?: string;
}

const TONE = {
  default: "from-plum-300 to-plum-500",
  cream: "from-cream-400 to-cream-600",
  wine: "from-wine-300 to-wine-500",
};

export const RatingBar = ({ label, value, tone = "default", className }: Props) => {
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className={cx("flex items-center gap-2.5", className)}>
      <span className="w-[72px] shrink-0 text-[10px] uppercase tracking-[0.16em] text-ink-400">
        {label}
      </span>
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cx(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= v ? `bg-gradient-to-r ${TONE[tone]}` : "bg-ink-800/70"
            )}
          />
        ))}
      </div>
      <span className="w-5 shrink-0 text-right font-mono text-[11px] text-ink-300">
        {v}
      </span>
    </div>
  );
};
