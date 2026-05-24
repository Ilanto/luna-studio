import type { MouseEvent } from "react";
import { Crown, Expand, Grid2X2, Pencil, Star, Trash2, Video } from "lucide-react";
import type { ResultEntry } from "../types";
import { ResultThumb } from "./ResultThumb";
import { RatingBar } from "./RatingBar";
import { formatRelative } from "../utils/dates";
import { cx } from "../utils/cx";
import type { Density } from "./ViewDensityToggle";

interface Props {
  result: ResultEntry;
  promptTitle?: string;
  characterName?: string;
  density?: Density;
  selected?: boolean;
  onSelect: () => void;
  onExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export const ResultCard = ({
  result,
  promptTitle,
  characterName,
  density = "comfortable",
  selected = false,
  onSelect,
  onExpand,
  onEdit,
  onDelete,
  onToggleFavorite,
}: Props) => {
  const stop = (cb: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    cb();
  };

  const aspect = density === "compact" ? "square" : density === "large" ? "portrait" : "square";
  const showAllRatings = density !== "compact";
  const padding = density === "compact" ? "p-3" : density === "large" ? "p-5" : "p-4";
  const titleSize =
    density === "compact" ? "text-[14px]" : density === "large" ? "text-[18px]" : "text-[16px]";

  const winner = result.resultType === "grid" ? result.variations.find((v) => v.isWinner) : undefined;
  const gridAvg =
    result.resultType === "grid" && result.variations.length > 0
      ? result.variations.reduce((s, v) => s + v.overall, 0) / result.variations.length
      : null;

  return (
    <article
      onClick={onSelect}
      className={cx(
        "card card-hover group relative flex cursor-pointer flex-col overflow-hidden transition",
        selected && "ring-2 ring-cream-400/45 ring-offset-2 ring-offset-ink-950 shadow-glow"
      )}
    >
      {result.favorite && (
        <span
          className="pointer-events-none absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-ink-950/80 text-cream-400 shadow-[0_4px_18px_rgba(212,180,131,0.35)] backdrop-blur-md"
          aria-hidden
        >
          <Star size={13} className="fill-cream-400" strokeWidth={1.5} />
        </span>
      )}

      {result.resultType !== "single" && (
        <span
          className={cx(
            "pointer-events-none absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-ink-950/80 px-2 py-1 text-[10px] uppercase tracking-[0.16em] backdrop-blur-md",
            result.resultType === "grid" ? "text-cream-300" : "text-plum-200"
          )}
        >
          {result.resultType === "grid" ? <Grid2X2 size={10} /> : <Video size={10} />}
          {result.resultType === "grid" ? "grid" : "video"}
        </span>
      )}

      <button
        onClick={stop(onExpand)}
        className="relative block w-full overflow-hidden text-left"
        aria-label="Görseli büyüt"
        title="Görseli büyüt"
      >
        <ResultThumb src={result.imageUrl} alt={result.title} aspect={aspect} fit={result.fitMode} />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent py-2 text-[10px] uppercase tracking-[0.18em] text-cream-200 opacity-0 transition-opacity group-hover:opacity-100">
          <Expand size={11} /> büyüt
        </span>
      </button>

      <div className={cx("flex flex-1 flex-col gap-2.5", padding)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="chip-wine">{result.model}</span>
              {result.resultType === "grid" && (
                <>
                  <span className="chip">{result.variations.length} varyasyon</span>
                  {winner && (
                    <span className="chip-cream inline-flex items-center gap-1">
                      <Crown size={9} className="fill-cream-400" />
                      winner {winner.label}
                    </span>
                  )}
                </>
              )}
            </div>
            <h3 className={cx("display truncate leading-tight text-ink-100", titleSize)}>
              {result.title}
            </h3>
            {(promptTitle || characterName) && density !== "compact" && (
              <div className="mt-0.5 truncate text-[11px] text-ink-500">
                {characterName && <span className="text-cream-400/85">{characterName}</span>}
                {characterName && promptTitle && <span className="mx-1 opacity-50">·</span>}
                {promptTitle && <span>{promptTitle}</span>}
              </div>
            )}
          </div>
          <button
            onClick={stop(onToggleFavorite)}
            className={cx(
              "shrink-0 rounded-full p-1.5 transition-all",
              result.favorite
                ? "text-cream-400 hover:scale-110"
                : "text-ink-500 hover:scale-110 hover:text-cream-400"
            )}
            aria-label="Favoriye ekle"
            title={result.favorite ? "Favoriden çıkar" : "Favoriye ekle"}
          >
            <Star size={16} strokeWidth={1.5} className={result.favorite ? "fill-cream-400" : ""} />
          </button>
        </div>

        <div className="space-y-1">
          <RatingBar label="Genel" value={result.overall} tone="wine" />
          {showAllRatings && (
            <>
              <RatingBar label="Yüz" value={result.faceConsistency} tone="cream" />
              {density === "large" && (
                <>
                  <RatingBar label="Gerçek" value={result.realism} />
                  <RatingBar label="Kıyafet" value={result.outfitAccuracy} />
                </>
              )}
            </>
          )}
          {gridAvg !== null && density !== "compact" && (
            <RatingBar label="Grid ort." value={Math.round(gridAvg * 10) / 10} tone="cream" />
          )}
        </div>

        {result.notes && density === "large" && (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-400">{result.notes}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.05] pt-2.5">
          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-500">
            {formatRelative(result.createdAt)}
          </span>
          <div className="flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
            <button onClick={stop(onEdit)} className="btn-ghost" aria-label="Düzenle" title="Düzenle">
              <Pencil size={14} strokeWidth={1.6} />
            </button>
            <button
              onClick={stop(onDelete)}
              className="btn-ghost text-ink-400 hover:text-red-300"
              aria-label="Sil"
              title="Sil"
            >
              <Trash2 size={14} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
