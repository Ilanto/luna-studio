import { ArrowUpRight, Copy, Crown, Expand, FileText, Grid2X2, Pencil, Sparkles, Star, Trash2, Video } from "lucide-react";
import { Link } from "react-router-dom";
import type { CharacterProfile, Prompt, ResultEntry, Variation } from "../types";
import { ResultThumb } from "./ResultThumb";
import { VariationThumb } from "./VariationThumb";
import { RatingBar } from "./RatingBar";
import { cx } from "../utils/cx";

interface Props {
  result: ResultEntry | null;
  prompt?: Prompt;
  character?: CharacterProfile;
  onEdit: () => void;
  onAddSimilar: () => void;
  onExpand: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onFocusVariation?: (index: number) => void;
}

export const ResultDetailPanel = ({
  result,
  prompt,
  character,
  onEdit,
  onAddSimilar,
  onExpand,
  onDelete,
  onToggleFavorite,
  onFocusVariation,
}: Props) => {
  if (!result) {
    return <Placeholder />;
  }

  const winner = result.resultType === "grid"
    ? result.variations.find((v) => v.isWinner)
    : undefined;

  return (
    <div className="card-raised relative animate-fade-in overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-wine-500/20 blur-3xl" />

      {/* Görsel */}
      <button onClick={onExpand} className="group relative block w-full" title="Görseli büyüt">
        <ResultThumb src={result.imageUrl} alt={result.title} aspect="portrait" fit={result.fitMode} />
        <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink-950/80 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-200 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
          <Expand size={11} /> büyüt
        </span>
        {winner && (
          <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink-950/80 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cream-300 backdrop-blur-md">
            <Crown size={10} className="fill-cream-400" /> {winner.label}
          </span>
        )}
        {result.favorite && (
          <span className="pointer-events-none absolute right-2 bottom-2 grid h-6 w-6 place-items-center rounded-full bg-ink-950/80 backdrop-blur-md">
            <Star size={11} className="fill-cream-400 text-cream-400" />
          </span>
        )}
      </button>

      <div className="relative space-y-3 p-4">
        {/* Başlık + model */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="display truncate text-[17px] leading-tight text-ink-100">{result.title}</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="chip-wine">{result.model}</span>
              {result.resultType === "grid" && (
                <span className="chip inline-flex items-center gap-1">
                  <Grid2X2 size={9} /> {result.variations.length} var.
                </span>
              )}
              {result.resultType === "video" && (
                <span className="chip inline-flex items-center gap-1"><Video size={9} /> video</span>
              )}
            </div>
          </div>
          <button
            onClick={onToggleFavorite}
            className={cx("shrink-0 rounded-full p-1.5 transition", result.favorite ? "text-cream-400" : "text-ink-600 hover:text-cream-400")}
            title={result.favorite ? "Favoriden çıkar" : "Favoriye ekle"}
          >
            <Star size={15} strokeWidth={1.5} className={result.favorite ? "fill-cream-400" : ""} />
          </button>
        </div>

        {/* Genel puan */}
        <div className="rounded-xl border border-white/[0.05] bg-ink-900/40 px-3 py-2">
          <RatingBar label="Genel" value={result.overall} tone="wine" />
        </div>

        {/* Detaylar accordion */}
        <details className="group">
          <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.2em] text-ink-600 hover:text-ink-300 transition">
            <span className="group-open:hidden">+ daha fazla</span>
            <span className="hidden group-open:inline">− kapat</span>
          </summary>
          <div className="mt-3 space-y-3">
            <div className="space-y-1.5 rounded-xl border border-white/[0.05] bg-ink-900/40 p-3">
              <RatingBar label="Yüz" value={result.faceConsistency} tone="cream" />
              <RatingBar label="Gerçek" value={result.realism} />
              <RatingBar label="Kıyafet" value={result.outfitAccuracy} />
            </div>

            {result.resultType === "grid" && result.variations.length > 0 && (
              <div className="space-y-1.5 rounded-xl border border-white/[0.05] bg-ink-900/30 p-3">
                <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-cream-400/80">
                  <Grid2X2 size={10} /> varyasyonlar
                </div>
                <div className="space-y-1">
                  {result.variations.map((v, i) => (
                    <VariationRow
                      key={v.id} v={v} index={i}
                      imageUrl={result.imageUrl}
                      count={result.variations.length}
                      onFocus={onFocusVariation ? () => onFocusVariation(i) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {(character || prompt) && (
              <div className="space-y-1 rounded-xl border border-white/[0.05] bg-ink-900/30 p-3">
                {character && (
                  <Link to="/characters" className="group/l flex items-center justify-between gap-2 rounded-lg px-1 py-1 text-sm text-ink-300 transition hover:text-cream-400">
                    <span className="inline-flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full border border-cream-400/30 bg-cream-400/10 text-[9px] font-mono text-cream-400">{character.name.slice(0,1).toUpperCase()}</span>
                      {character.name}
                    </span>
                    <ArrowUpRight size={12} className="opacity-0 transition group-hover/l:opacity-100" />
                  </Link>
                )}
                {prompt && (
                  <Link to={`/editor/${prompt.id}`} className="group/l flex items-center justify-between gap-2 rounded-lg px-1 py-1 text-sm text-ink-300 transition hover:text-cream-400">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <FileText size={12} className="shrink-0 text-ink-500" />
                      <span className="truncate">{prompt.title}</span>
                    </span>
                    <ArrowUpRight size={12} className="shrink-0 opacity-0 transition group-hover/l:opacity-100" />
                  </Link>
                )}
              </div>
            )}

            {result.notes && (
              <p className="rounded-xl border border-white/[0.05] bg-ink-900/40 p-3 text-[12.5px] leading-relaxed text-ink-300">{result.notes}</p>
            )}
            {result.issues && (
              <p className="rounded-xl border border-red-500/15 bg-red-950/25 p-3 text-[12.5px] leading-relaxed text-red-200/85">{result.issues}</p>
            )}
          </div>
        </details>
      </div>

      {/* Aksiyon butonları */}
      <div className="relative flex items-center gap-2 border-t border-white/[0.05] bg-ink-900/40 px-4 py-3">
        <button onClick={onEdit} className="btn-primary flex-1 justify-center">
          <Pencil size={13} /> Düzenle
        </button>
        <button onClick={onAddSimilar} className="btn justify-center px-3" title="Benzer ekle">
          <Copy size={13} />
        </button>
        <button onClick={onExpand} className="btn justify-center px-3" title="Görseli büyüt">
          <Expand size={13} />
        </button>
        <button onClick={onDelete} className="btn justify-center px-3 text-ink-500 hover:text-red-300 hover:!border-red-500/40" title="Sil">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

const VariationRow = ({
  v,
  index,
  imageUrl,
  count,
  onFocus,
}: {
  v: Variation;
  index: number;
  imageUrl: string;
  count: number;
  onFocus?: () => void;
}) => {
  const hasAny =
    v.overall + v.faceConsistency + v.realism + v.outfitAccuracy > 0 ||
    !!v.notes ||
    !!v.issues;
  return (
    <details
      className={cx(
        "group rounded-lg border bg-ink-950/40 transition open:bg-ink-950/55",
        v.isWinner ? "border-cream-400/45" : "border-white/[0.05]"
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-2 py-1.5">
        <div className="flex items-center gap-2 text-[12px]">
          {onFocus && imageUrl ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onFocus();
              }}
              className="shrink-0 rounded-md transition hover:ring-2 hover:ring-cream-400/40"
              title="Büyüt"
              aria-label={`${v.label} büyüt`}
            >
              <VariationThumb
                src={imageUrl}
                index={index}
                count={count}
                label={v.label}
                className="h-7 w-7"
                rounded="rounded-md"
              />
            </button>
          ) : (
            <VariationThumb
              src={imageUrl}
              index={index}
              count={count}
              label={v.label}
              className="h-7 w-7 shrink-0"
              rounded="rounded-md"
            />
          )}
          <span
            className={cx(
              "grid h-5 w-7 place-items-center rounded text-[10px] font-mono",
              v.isWinner
                ? "bg-cream-400/15 text-cream-300"
                : "bg-white/[0.05] text-ink-300"
            )}
          >
            {v.label}
          </span>
          {v.isWinner && (
            <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-[0.18em] text-cream-300">
              <Crown size={9} className="fill-cream-400" /> kazanan
            </span>
          )}
          {!hasAny && <span className="text-[10.5px] italic text-ink-500">değerlendirilmedi</span>}
        </div>
        <div className="flex items-center gap-2">
          {v.overall > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10.5px] text-ink-400">
              <Star size={9} className="fill-cream-400 text-cream-400" />
              {v.overall}
            </span>
          )}
          <span className="text-[9.5px] uppercase tracking-[0.18em] text-ink-500 group-open:hidden">
            ›
          </span>
          <span className="hidden text-[9.5px] uppercase tracking-[0.18em] text-ink-500 group-open:inline">
            ⌄
          </span>
        </div>
      </summary>
      <div className="space-y-2 border-t border-white/[0.05] px-2.5 py-2 text-[11.5px]">
        {imageUrl && (
          onFocus ? (
            <button
              type="button"
              onClick={onFocus}
              className="group/zoom relative block w-full overflow-hidden rounded-md"
              title="Büyüt"
            >
              <VariationThumb
                src={imageUrl}
                index={index}
                count={count}
                label={v.label}
                className="!aspect-[4/3] w-full"
                rounded="rounded-md"
              />
              <span className="pointer-events-none absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-ink-950/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-cream-300 opacity-0 backdrop-blur-md transition-opacity group-hover/zoom:opacity-100">
                büyüt
              </span>
            </button>
          ) : (
            <VariationThumb
              src={imageUrl}
              index={index}
              count={count}
              label={v.label}
              className="!aspect-[4/3] w-full"
              rounded="rounded-md"
            />
          )
        )}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <MiniStat label="Genel" value={v.overall} />
          <MiniStat label="Yüz" value={v.faceConsistency} />
          <MiniStat label="Gerç." value={v.realism} />
          <MiniStat label="Kıy." value={v.outfitAccuracy} />
        </div>
        {v.notes && (
          <p className="whitespace-pre-wrap text-[11.5px] leading-relaxed text-ink-300">
            {v.notes}
          </p>
        )}
        {v.issues && (
          <p className="whitespace-pre-wrap rounded bg-red-950/30 px-2 py-1 text-[11.5px] leading-relaxed text-red-200/85">
            {v.issues}
          </p>
        )}
      </div>
    </details>
  );
};

const MiniStat = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between">
    <span className="text-ink-500">{label}</span>
    <span className={cx(value > 0 ? "text-ink-200" : "text-ink-600")}>{value}/5</span>
  </div>
);

const Placeholder = () => (
  <div className="card-raised relative flex animate-fade-in flex-col items-center justify-center gap-4 overflow-hidden p-10 text-center">
    <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-wine-500/15 blur-3xl animate-pulse-soft" />
    <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.08] bg-ink-850 text-cream-400 shadow-glow">
      <Sparkles size={20} />
    </div>
    <div className="relative max-w-[260px]">
      <div className="display text-xl text-ink-100">Bir sonucu seç</div>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-400">
        Detaylarını burada incele — büyüt, düzenle ya da benzerini ekle.
      </p>
    </div>
  </div>
);
