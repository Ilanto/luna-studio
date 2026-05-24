import { Link } from "react-router-dom";
import { Copy, ImagePlus, Pencil, Star, Trash2 } from "lucide-react";
import type { Prompt } from "../types";
import { Stars } from "./Stars";
import { formatRelative } from "../utils/dates";
import { cx } from "../utils/cx";

interface Props {
  prompt: Prompt;
  resultCount?: number;
  onCopy: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onAddResult?: () => void;
}

export const PromptCard = ({ prompt, resultCount = 0, onCopy, onDelete, onToggleFavorite, onAddResult }: Props) => {
  return (
    <article className="card card-hover group flex flex-col gap-4 p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="chip-wine">{prompt.category}</span>
            {prompt.favorite && <span className="chip-cream">★ favori</span>}
          </div>
          <h3 className="display truncate text-[20px] leading-tight text-ink-100">
            {prompt.title}
          </h3>
          {prompt.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-ink-400">{prompt.description}</p>
          )}
        </div>
        <button
          onClick={onToggleFavorite}
          className={cx(
            "shrink-0 rounded-full p-1.5 transition-all",
            prompt.favorite
              ? "text-cream-400 hover:scale-110"
              : "text-ink-500 hover:scale-110 hover:text-cream-400"
          )}
          aria-label="Favoriye ekle"
        >
          <Star size={16} strokeWidth={1.5} className={prompt.favorite ? "fill-cream-400" : ""} />
        </button>
      </header>

      <div className="relative">
        <p className="mask-fade-b max-h-[88px] overflow-hidden rounded-xl border border-white/[0.05] bg-ink-950/45 p-3 font-mono text-[12.5px] leading-relaxed text-ink-300">
          {prompt.body}
        </p>
      </div>

      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.slice(0, 5).map((t) => (
            <span key={t} className="chip">#{t}</span>
          ))}
        </div>
      )}

      <footer className="flex items-end justify-between gap-3 border-t border-white/[0.04] pt-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Stars value={prompt.rating} readOnly size={13} />
            {resultCount > 0 && (
              <Link
                to={`/results?prompt=${prompt.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-cream-400/25 bg-cream-400/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-cream-400 transition hover:bg-cream-400/15"
                title={`${resultCount} bağlı sonuç`}
              >
                <ImagePlus size={10} /> {resultCount}
              </Link>
            )}
          </div>
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
            {formatRelative(prompt.updatedAt)}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
          {onAddResult && (
            <button
              onClick={onAddResult}
              className="btn-ghost text-cream-400/85 hover:text-cream-400"
              aria-label="Sonuç ekle"
              title="Sonuç ekle"
            >
              <ImagePlus size={15} strokeWidth={1.6} />
            </button>
          )}
          <button onClick={onCopy} className="btn-ghost" aria-label="Kopyala" title="Kopyala">
            <Copy size={15} strokeWidth={1.6} />
          </button>
          <Link to={`/editor/${prompt.id}`} className="btn-ghost" aria-label="Düzenle" title="Düzenle">
            <Pencil size={15} strokeWidth={1.6} />
          </Link>
          <button
            onClick={onDelete}
            className="btn-ghost text-ink-400 hover:text-red-300"
            aria-label="Sil"
            title="Sil"
          >
            <Trash2 size={15} strokeWidth={1.6} />
          </button>
        </div>
      </footer>
    </article>
  );
};
