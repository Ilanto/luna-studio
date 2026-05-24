import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cx } from "../utils/cx";

interface Props {
  src: string;
  alt?: string;
  aspect?: "square" | "portrait" | "wide" | "free";
  fit?: "cover" | "contain";
  className?: string;
}

const ASPECT = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  wide: "aspect-[16/10]",
  free: "",
};

export const ResultThumb = ({ src, alt = "", aspect = "portrait", fit = "cover", className }: Props) => {
  const [errored, setErrored] = useState(false);
  const hasImage = src.trim() !== "" && !errored;

  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-950/60",
        ASPECT[aspect],
        className
      )}
    >
      {hasImage ? (
        fit === "contain" ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(140,58,82,0.18),rgba(8,6,11,0.85))]">
            <img
              src={src}
              alt={alt}
              loading="lazy"
              onError={() => setErrored(true)}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setErrored(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )
      ) : (
        <Placeholder />
      )}
    </div>
  );
};

const Placeholder = () => (
  <div className="absolute inset-0 grid place-items-center">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(232,212,184,0.18),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(140,58,82,0.25),transparent_60%),linear-gradient(160deg,#16131A,#0E0B10)]" />
    <div className="relative flex flex-col items-center gap-2 text-ink-500">
      <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden>
        <defs>
          <radialGradient id="thumb-moon" cx="38%" cy="34%" r="68%">
            <stop offset="0%" stopColor="#F0E4CD" />
            <stop offset="55%" stopColor="#8C3A52" />
            <stop offset="100%" stopColor="#13080F" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="18" fill="url(#thumb-moon)" opacity="0.85" />
        <circle cx="40" cy="26" r="14" fill="#0E0B10" />
      </svg>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em]">
        <ImageOff size={11} /> görsel yok
      </div>
    </div>
  </div>
);
