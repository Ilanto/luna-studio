import { Star } from "lucide-react";
import { cx } from "../utils/cx";

interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}

export const Stars = ({ value, onChange, size = 16, readOnly = false }: Props) => {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= value;
        const Comp = readOnly ? "span" : "button";
        return (
          <Comp
            key={i}
            type="button"
            onClick={readOnly ? undefined : () => onChange?.(value === i ? 0 : i)}
            className={cx(
              "transition-transform",
              !readOnly && "hover:scale-110 cursor-pointer"
            )}
            aria-label={`${i} yıldız`}
          >
            <Star
              size={size}
              strokeWidth={1.4}
              className={filled ? "fill-cream-400 stroke-cream-400" : "stroke-ink-500"}
            />
          </Comp>
        );
      })}
    </div>
  );
};
