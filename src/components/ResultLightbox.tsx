import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Crown, Grid2X2, Maximize2, Pencil, X } from "lucide-react";
import type { ResultEntry } from "../types";
import { ResultThumb } from "./ResultThumb";
import { VariationThumb } from "./VariationThumb";
import { RatingBar } from "./RatingBar";
import { formatRelative } from "../utils/dates";
import { cx } from "../utils/cx";

interface Props {
  open: boolean;
  result: ResultEntry | null;
  variationIndex?: number | null;
  onClose: () => void;
  onEdit?: () => void;
  onPrevVariation?: () => void;
  onNextVariation?: () => void;
  onShowWhole?: () => void;
  onFocusVariation?: (index: number) => void;
}

export const ResultLightbox = ({
  open,
  result,
  variationIndex = null,
  onClose,
  onEdit,
  onPrevVariation,
  onNextVariation,
  onShowWhole,
  onFocusVariation,
}: Props) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (variationIndex === null) return;
      if (e.key === "ArrowLeft" && onPrevVariation) onPrevVariation();
      if (e.key === "ArrowRight" && onNextVariation) onNextVariation();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, onPrevVariation, onNextVariation, variationIndex]);

  if (!open || !result) return null;

  const isVariation = variationIndex !== null && result.resultType === "grid" && result.variations.length > 0;
  const variation = isVariation ? result.variations[variationIndex!] : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 animate-fade-in bg-black/85 backdrop-blur-xl" onClick={onClose} />
      <div className="relative z-10 grid h-full max-h-[90vh] w-full max-w-6xl animate-scale-in grid-rows-[1fr_auto] gap-4 sm:grid-cols-[1fr_340px] sm:grid-rows-1">
        <div className="relative flex min-h-0 flex-col gap-3">
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-950/40">
            {isVariation ? (
              <VariationThumb
                src={result.imageUrl}
                index={variationIndex!}
                count={result.variations.length}
                label={variation?.label}
                className="!aspect-auto h-full w-full"
                rounded="rounded-3xl"
              />
            ) : (
              <ResultThumb
                src={result.imageUrl}
                alt={result.title}
                aspect="free"
                fit={result.fitMode}
                className="h-full w-full"
              />
            )}

            {isVariation && (
              <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink-950/85 px-3 py-1 text-[10.5px] uppercase tracking-[0.22em] text-cream-200 backdrop-blur-md">
                <Grid2X2 size={10} /> {variation?.label}
                {variation?.isWinner && (
                  <span className="inline-flex items-center gap-0.5 text-cream-400">
                    <Crown size={9} className="fill-cream-400" /> kazanan
                  </span>
                )}
              </div>
            )}

            {isVariation && (onPrevVariation || onNextVariation) && (
              <>
                <button
                  onClick={onPrevVariation}
                  className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/70 text-ink-100 backdrop-blur-md transition hover:bg-ink-900/80"
                  aria-label="Önceki varyasyon"
                  title="Önceki (←)"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={onNextVariation}
                  className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/70 text-ink-100 backdrop-blur-md transition hover:bg-ink-900/80"
                  aria-label="Sonraki varyasyon"
                  title="Sonraki (→)"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {result.resultType === "grid" && result.variations.length > 0 && onFocusVariation && (
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={onShowWhole}
                className={cx(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.16em] transition",
                  !isVariation
                    ? "border-cream-400/45 bg-cream-400/10 text-cream-300"
                    : "border-white/[0.08] text-ink-400 hover:text-ink-200"
                )}
                title="Tüm grid'i göster"
              >
                <Maximize2 size={11} /> tümü
              </button>
              {result.variations.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => onFocusVariation(i)}
                  className={cx(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.18em] transition",
                    variationIndex === i
                      ? "border-cream-400/45 bg-cream-400/10 text-cream-300"
                      : "border-white/[0.08] text-ink-400 hover:text-ink-200"
                  )}
                >
                  {v.isWinner && <Crown size={9} className="fill-cream-400 text-cream-400" />}
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="card-raised relative flex max-h-full flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.32em] text-cream-400/80">
                {isVariation ? `varyasyon ${variation?.label}` : "sonuç"}
              </div>
              <div className="display mt-0.5 truncate text-lg text-ink-100">
                {isVariation ? `${result.title} · ${variation?.label}` : result.title}
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost shrink-0" aria-label="Kapat">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
            {isVariation && variation ? (
              <>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="chip-wine">{result.model}</span>
                  {variation.isWinner && (
                    <span className="chip-cream inline-flex items-center gap-1">
                      <Crown size={10} className="fill-cream-400" /> kazanan
                    </span>
                  )}
                  <span className="chip">{formatRelative(result.createdAt)}</span>
                </div>

                <div className="space-y-1.5 rounded-2xl border border-white/[0.05] bg-ink-900/40 p-3">
                  <RatingBar label="Genel" value={variation.overall} tone="wine" />
                  <RatingBar label="Yüz" value={variation.faceConsistency} tone="cream" />
                  <RatingBar label="Gerçek" value={variation.realism} />
                  <RatingBar label="Kıyafet" value={variation.outfitAccuracy} />
                </div>

                {variation.notes && (
                  <div>
                    <div className="label">Notlar</div>
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-300">
                      {variation.notes}
                    </p>
                  </div>
                )}
                {variation.issues && (
                  <div>
                    <div className="label">Sorunlar</div>
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-red-200/85">
                      {variation.issues}
                    </p>
                  </div>
                )}
                {result.variationNotes && (
                  <div>
                    <div className="label">Grid hakkında</div>
                    <p className="whitespace-pre-wrap text-[12.5px] italic leading-relaxed text-ink-400">
                      {result.variationNotes}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="chip-wine">{result.model}</span>
                  {result.favorite && <span className="chip-cream">★ favori</span>}
                  <span className="chip">{formatRelative(result.createdAt)}</span>
                </div>

                <div className="space-y-1.5 rounded-2xl border border-white/[0.05] bg-ink-900/40 p-3">
                  <RatingBar label="Genel" value={result.overall} tone="wine" />
                  <RatingBar label="Yüz" value={result.faceConsistency} tone="cream" />
                  <RatingBar label="Gerçek" value={result.realism} />
                  <RatingBar label="Kıyafet" value={result.outfitAccuracy} />
                </div>

                {result.notes && (
                  <div>
                    <div className="label">Notlar</div>
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-300">
                      {result.notes}
                    </p>
                  </div>
                )}
                {result.issues && (
                  <div>
                    <div className="label">Hatalar</div>
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-red-200/85">
                      {result.issues}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {onEdit && (
            <div className="border-t border-white/[0.05] px-5 py-4">
              <button onClick={onEdit} className="btn-primary w-full justify-center">
                <Pencil size={15} /> Düzenle
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
