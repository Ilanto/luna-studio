import { ImageOff } from "lucide-react";
import { cx } from "../utils/cx";

interface Props {
  src: string;
  index: number;
  count?: number;
  label?: string;
  className?: string;
  rounded?: string;
}

const positionsFor = (count: number): string[] => {
  if (count === 2) return ["0% 0%", "100% 0%"];
  if (count === 4) return ["0% 0%", "100% 0%", "0% 100%", "100% 100%"];
  if (count === 6) {
    return [
      "0% 0%", "50% 0%", "100% 0%",
      "0% 100%", "50% 100%", "100% 100%",
    ];
  }
  if (count === 9) {
    return [
      "0% 0%", "50% 0%", "100% 0%",
      "0% 50%", "50% 50%", "100% 50%",
      "0% 100%", "50% 100%", "100% 100%",
    ];
  }
  // Bilinmeyen sayılar için: tüm görseli göster
  return Array.from({ length: count }, () => "center center");
};

const sizeFor = (count: number): string => {
  if (count === 2) return "200% 100%";
  if (count === 4) return "200% 200%";
  if (count === 6) return "300% 200%";
  if (count === 9) return "300% 300%";
  return "100% 100%";
};

export const VariationThumb = ({
  src,
  index,
  count = 4,
  label,
  className,
  rounded = "rounded-lg",
}: Props) => {
  const positions = positionsFor(count);
  const pos = positions[index] ?? "0% 0%";
  const size = sizeFor(count);

  if (!src) {
    return (
      <div
        className={cx(
          "relative grid aspect-square place-items-center overflow-hidden border border-dashed border-white/[0.08] bg-ink-950/40 text-ink-600",
          rounded,
          className
        )}
        role="img"
        aria-label={label ? `${label} (boş)` : "boş varyasyon"}
      >
        <ImageOff size={14} strokeWidth={1.4} />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label ?? `Varyasyon ${index + 1}`}
      className={cx(
        "relative aspect-square overflow-hidden border border-white/[0.06] bg-ink-950",
        rounded,
        className
      )}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: size,
        backgroundPosition: pos,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};
