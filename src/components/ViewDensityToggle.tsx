import { LayoutGrid, Rows3, Square } from "lucide-react";
import { cx } from "../utils/cx";

export type Density = "compact" | "comfortable" | "large";

const OPTIONS: { value: Density; label: string; Icon: typeof LayoutGrid }[] = [
  { value: "compact", label: "Sıkı", Icon: Rows3 },
  { value: "comfortable", label: "Dengeli", Icon: LayoutGrid },
  { value: "large", label: "Geniş", Icon: Square },
];

interface Props {
  value: Density;
  onChange: (next: Density) => void;
}

export const ViewDensityToggle = ({ value, onChange }: Props) => {
  return (
    <div
      role="radiogroup"
      aria-label="Görünüm yoğunluğu"
      className="inline-flex items-center rounded-full border border-white/[0.06] bg-ink-900/45 p-0.5"
    >
      {OPTIONS.map(({ value: v, label, Icon }) => {
        const active = v === value;
        return (
          <button
            key={v}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] transition",
              active
                ? "bg-wine-500/22 text-ink-100 shadow-[inset_0_0_0_1px_rgba(140,58,82,0.45)]"
                : "text-ink-400 hover:text-ink-200"
            )}
          >
            <Icon size={12} strokeWidth={1.7} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
