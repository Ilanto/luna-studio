import { Crown, Expand, Pencil, X } from "lucide-react";
import type { CharacterProfile, Prompt, ResultEntry } from "../types";
import { ResultThumb } from "./ResultThumb";
import { cx } from "../utils/cx";

interface Props {
  open: boolean;
  results: [ResultEntry, ResultEntry] | null;
  prompts: Record<string, Prompt>;
  characters: Record<string, CharacterProfile>;
  onClose: () => void;
  onEdit: (id: string) => void;
  onExpand: (id: string) => void;
}

type MetricKey = "overall" | "faceConsistency" | "realism" | "outfitAccuracy";

const METRICS: Array<{ key: MetricKey; label: string }> = [
  { key: "overall", label: "Genel" },
  { key: "faceConsistency", label: "Yüz" },
  { key: "realism", label: "Gerçekçilik" },
  { key: "outfitAccuracy", label: "Kıyafet" },
];

const Dots = ({ value, isBetter, isEqual }: { value: number; isBetter: boolean; isEqual: boolean }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }, (_, j) => (
      <div
        key={j}
        className={cx(
          "h-1.5 w-1.5 rounded-full transition-all",
          j < value
            ? isBetter
              ? "bg-cream-400"
              : isEqual
              ? "bg-ink-400"
              : "bg-ink-700"
            : "bg-ink-800/50"
        )}
      />
    ))}
    <span
      className={cx(
        "ml-1 min-w-[1.25rem] text-right font-mono text-[12px]",
        isBetter ? "text-cream-300" : isEqual ? "text-ink-400" : "text-ink-600"
      )}
    >
      {value > 0 ? value : "—"}
    </span>
  </div>
);

const ResultCol = ({
  r,
  other,
  isWinner,
  prompt,
  character,
  num,
  onEdit,
  onExpand,
}: {
  r: ResultEntry;
  other: ResultEntry;
  isWinner: boolean;
  prompt?: Prompt;
  character?: CharacterProfile;
  num: 1 | 2;
  onEdit: () => void;
  onExpand: () => void;
}) => (
  <div
    className={cx(
      "relative flex flex-col gap-4 p-5",
      isWinner && "bg-cream-400/[0.025]"
    )}
  >
    {isWinner && (
      <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border border-cream-400/35 bg-cream-400/12 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-cream-300">
        <Crown size={8} className="fill-cream-400" /> kazanan
      </div>
    )}

    <div className="absolute left-4 top-4 z-10 grid h-5 w-5 place-items-center rounded-full bg-ink-900/80 text-[9px] font-mono text-ink-300 ring-1 ring-white/[0.1]">
      {num}
    </div>

    <button
      onClick={onExpand}
      className="mt-4 block w-full overflow-hidden rounded-2xl"
      title="Büyüt"
    >
      <ResultThumb src={r.imageUrl} alt={r.title} aspect="square" fit={r.fitMode} />
    </button>

    <div>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <span className="chip-wine">{r.model}</span>
        {character && <span className="chip">{character.name}</span>}
      </div>
      <h3 className="display text-base leading-snug text-ink-100">{r.title}</h3>
      {prompt && (
        <div className="mt-0.5 truncate text-[11px] text-ink-500">{prompt.title}</div>
      )}
    </div>

    <div className="rounded-xl border border-white/[0.06] bg-ink-900/30 p-3 space-y-2.5">
      {METRICS.map(({ key, label }) => {
        const myVal = r[key];
        const theirVal = other[key];
        const isBetter = myVal > theirVal;
        const isEqual = myVal === theirVal;
        return (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="w-20 shrink-0 text-[11px] text-ink-500">{label}</span>
            <Dots value={myVal} isBetter={isBetter} isEqual={isEqual} />
          </div>
        );
      })}
    </div>

    {r.notes && (
      <p className="line-clamp-3 text-[12px] leading-relaxed text-ink-400">{r.notes}</p>
    )}

    <div className="mt-auto flex gap-2">
      <button onClick={onExpand} className="btn flex-1 justify-center">
        <Expand size={13} /> Büyüt
      </button>
      <button onClick={onEdit} className="btn flex-1 justify-center">
        <Pencil size={13} /> Düzenle
      </button>
    </div>
  </div>
);

export const CompareModal = ({
  open,
  results,
  prompts,
  characters,
  onClose,
  onEdit,
  onExpand,
}: Props) => {
  if (!open || !results) return null;
  const [a, b] = results;

  const aScore = METRICS.reduce((s, m) => s + (a[m.key] > b[m.key] ? 1 : 0), 0);
  const bScore = METRICS.reduce((s, m) => s + (b[m.key] > a[m.key] ? 1 : 0), 0);
  const aWins = aScore > bScore;
  const bWins = bScore > aScore;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center p-4 py-8 sm:items-center">
        <div
          className="card-raised relative w-full max-w-4xl animate-scale-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-wine-500/20 blur-3xl" />

          <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-cream-400/80">karşılaştırma</div>
              <div className="display mt-1 text-xl text-ink-100">Yan yana</div>
            </div>
            <button onClick={onClose} className="btn-ghost" aria-label="Kapat">
              <X size={16} />
            </button>
          </div>

          <div className="grid divide-white/[0.05] sm:grid-cols-2 sm:divide-x">
            <ResultCol
              r={a}
              other={b}
              isWinner={aWins}
              prompt={a.promptId ? prompts[a.promptId] : undefined}
              character={a.characterId ? characters[a.characterId] : undefined}
              num={1}
              onEdit={() => { onEdit(a.id); onClose(); }}
              onExpand={() => onExpand(a.id)}
            />
            <ResultCol
              r={b}
              other={a}
              isWinner={bWins}
              prompt={b.promptId ? prompts[b.promptId] : undefined}
              character={b.characterId ? characters[b.characterId] : undefined}
              num={2}
              onEdit={() => { onEdit(b.id); onClose(); }}
              onExpand={() => onExpand(b.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
