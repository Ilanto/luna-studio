import { cx } from "../utils/cx";

interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  size?: "sm" | "md";
}

export const Toggle = ({ checked, onChange, label, size = "md" }: Props) => {
  const dims =
    size === "sm"
      ? { wrap: "h-4 w-7", knob: "h-3 w-3", top: "top-[2px]", onX: "left-[14px]", offX: "left-[2px]" }
      : { wrap: "h-5 w-9", knob: "h-3.5 w-3.5", top: "top-[3px]", onX: "left-[19px]", offX: "left-[2px]" };

  return (
    <label className="group inline-flex cursor-pointer select-none items-center gap-2.5">
      {label && (
        <span
          className={cx(
            "text-[10px] uppercase tracking-[0.18em] transition-colors",
            checked ? "text-cream-400" : "text-ink-500"
          )}
        >
          {label}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative shrink-0 rounded-full border transition-colors duration-200",
          dims.wrap,
          checked
            ? "border-cream-400/45 bg-gradient-to-b from-wine-400/60 to-wine-600/70 shadow-[0_0_0_3px_rgba(232,212,184,0.06)]"
            : "border-white/[0.08] bg-ink-900/60"
        )}
      >
        <span
          className={cx(
            "absolute rounded-full transition-[left,background-color,box-shadow] duration-200 ease-out",
            dims.top,
            dims.knob,
            checked ? `${dims.onX} bg-cream-400 shadow-cream-glow` : `${dims.offX} bg-ink-500`
          )}
        />
      </button>
    </label>
  );
};
