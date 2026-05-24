import type { MouseEvent } from "react";
import { Crown, Expand, Pencil, Trash2 } from "lucide-react";
import type { ResultEntry, Variation } from "../types";
import { VariationThumb } from "./VariationThumb";
import { RatingBar } from "./RatingBar";
import { formatRelative } from "../utils/dates";
import { cx } from "../utils/cx";

interface Props {
  result: ResultEntry;
  winner: Variation;
  winnerIndex: number;
  promptTitle?: string;
  characterName?: string;
  selected?: boolean;
  onSelect: () => void;
  onExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const WinnerCard = ({
  result,
  winner,
  winnerIndex,
  promptTitle,
  characterName,
  selected = false,
  onSelect,
  onExpand,
  onEdit,
  onDelete,
}: Props) => {
  const stop = (cb: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    cb();
  };

  return (
    <article
      onClick={onSelect}
      className={cx(
        "card card-hover group relative flex cursor-pointer flex-col overflow-hidden transition",
        selected && "ring-2 ring-cream-400/45 ring-offset-2 ring-offset-ink-950 shadow-glow"
      )}
    >
      <span className="pointer-events-none absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-cream-400/15 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cream-200 shadow-[0_4px_18px_rgba(212,180,131,0.35)] backdrop-blur-md">
        <Crown size={11} className="fill-cream-400 text-cream-400" />
        winner {winner.label}
      </span>

      <button
        onClick={stop(onExpand)}
        className="relative block w-full overflow-hidden text-left"
        aria-label={`${winner.label} büyüt`}
        title="Winner karesini büyüt"
      >
        <VariationThumb
          src={result.imageUrl}
          index={winnerIndex}
          count={result.variations.length}
          label={winner.label}
          className="!aspect-[4/3] w-full"
          rounded="rounded-none"
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent py-2 text-[10px] uppercase tracking-[0.18em] text-cream-200 opacity-0 transition-opacity group-hover:opacity-100">
          <Expand size={11} /> zoom
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="chip-wine">{result.model}</span>
              <span className="chip">{result.variations.length} varyasyon</span>
            </div>
            <h3 className="display truncate text-[16px] leading-tight text-ink-100">
              {result.title}
              <span className="ml-1.5 text-cream-300/85">· {winner.label}</span>
            </h3>
            {(promptTitle || characterName) && (
              <div className="mt-0.5 truncate text-[11px] text-ink-500">
                {characterName && <span className="text-cream-400/85">{characterName}</span>}
                {characterName && promptTitle && <span className="mx-1 opacity-50">·</span>}
                {promptTitle && <span>{promptTitle}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-cream-400/15 bg-cream-400/[0.04] p-2.5">
          <RatingBar label="Genel" value={winner.overall} tone="cream" />
          <RatingBar label="Yüz" value={winner.faceConsistency} tone="cream" />
          <RatingBar label="Gerçek" value={winner.realism} />
          <RatingBar label="Kıyafet" value={winner.outfitAccuracy} />
        </div>

        {winner.notes && (
          <p className="line-clamp-2 rounded-lg bg-ink-950/40 px-2.5 py-1.5 text-[12px] italic leading-relaxed text-ink-300">
            “{winner.notes}”
          </p>
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
              aria-label="Sonucu sil"
              title="Sonucu sil"
            >
              <Trash2 size={14} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
