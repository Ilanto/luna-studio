import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BarChart3, Crown, Grid2X2, Trophy } from "lucide-react";
import { useStudio } from "../hooks/useStudio";
import { RatingBar } from "../components/RatingBar";
import { EmptyState } from "../components/EmptyState";
import { cx } from "../utils/cx";

interface ModelStat {
  model: string;
  total: number;
  grids: number;
  winners: number;
  avgOverall: number;
  avgFace: number;
  avgRealism: number;
  avgOutfit: number;
}

export const ModelStats = () => {
  const { results } = useStudio();

  const stats = useMemo<ModelStat[]>(() => {
    const acc: Record<string, {
      total: number; grids: number; winners: number;
      sumOverall: number; sumFace: number; sumRealism: number; sumOutfit: number;
    }> = {};

    for (const r of results) {
      if (!acc[r.model]) {
        acc[r.model] = { total: 0, grids: 0, winners: 0, sumOverall: 0, sumFace: 0, sumRealism: 0, sumOutfit: 0 };
      }
      const s = acc[r.model];
      s.total += 1;
      if (r.resultType === "grid") s.grids += 1;
      if (r.variations.some((v) => v.isWinner)) s.winners += 1;
      s.sumOverall += r.overall;
      s.sumFace += r.faceConsistency;
      s.sumRealism += r.realism;
      s.sumOutfit += r.outfitAccuracy;
    }

    return Object.entries(acc)
      .map(([model, s]): ModelStat => ({
        model,
        total: s.total,
        grids: s.grids,
        winners: s.winners,
        avgOverall: s.total > 0 ? s.sumOverall / s.total : 0,
        avgFace: s.total > 0 ? s.sumFace / s.total : 0,
        avgRealism: s.total > 0 ? s.sumRealism / s.total : 0,
        avgOutfit: s.total > 0 ? s.sumOutfit / s.total : 0,
      }))
      .sort((a, b) => b.avgOverall - a.avgOverall);
  }, [results]);

  if (stats.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 size={20} />}
        title="Henüz karşılaştırılacak veri yok"
        description="Galeriye birkaç sonuç ekleyince modellerin performansı burada görünür."
        action={
          <Link to="/results" className="btn-primary">
            Galeriye git
          </Link>
        }
      />
    );
  }

  const best = stats[0];

  return (
    <div className="space-y-6 px-6 pb-28 pt-6 sm:px-10">
      {/* Başlık */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.32em] text-cream-400/80">karşılaştırma</div>
          <h1 className="display mt-1 text-2xl text-ink-100">Model Performansı</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip">{stats.length} model</span>
          <span className="chip">{results.length} sonuç</span>
        </div>
      </div>

      {/* Lider panosu — top 3 */}
      {stats.length >= 2 && (
        <div className="card p-5">
          <div className="mb-4 text-[10px] uppercase tracking-[0.22em] text-ink-500">genel puana göre sıralama</div>
          <div className="space-y-2">
            {stats.slice(0, Math.min(stats.length, 5)).map((s, i) => {
              const pct = best.avgOverall > 0 ? (s.avgOverall / best.avgOverall) * 100 : 0;
              return (
                <div key={s.model} className="flex items-center gap-3">
                  <span className={cx(
                    "w-5 shrink-0 text-center font-mono text-[11px]",
                    i === 0 ? "text-cream-400" : i === 1 ? "text-ink-300" : "text-ink-500"
                  )}>
                    {i === 0 ? <Trophy size={13} className="mx-auto fill-cream-400 text-cream-400" /> : `#${i + 1}`}
                  </span>
                  <span className="w-28 shrink-0 truncate text-[13px] text-ink-200">{s.model}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-ink-800/60" style={{ height: 6 }}>
                    <div
                      className={cx(
                        "h-full rounded-full transition-all duration-700",
                        i === 0
                          ? "bg-gradient-to-r from-cream-500/80 to-cream-300"
                          : "bg-gradient-to-r from-wine-600/70 to-wine-400/80"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={cx(
                    "w-8 shrink-0 text-right font-mono text-[12px]",
                    i === 0 ? "text-cream-300" : "text-ink-400"
                  )}>
                    {s.avgOverall > 0 ? s.avgOverall.toFixed(1) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Model kartları */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((s, i) => (
          <ModelCard key={s.model} stat={s} rank={i + 1} isTop={i === 0} />
        ))}
      </div>
    </div>
  );
};

const ModelCard = ({ stat, rank, isTop }: { stat: ModelStat; rank: number; isTop: boolean }) => (
  <div className={cx(
    "card card-hover group relative flex flex-col gap-4 overflow-hidden p-5 transition",
    isTop && "border-cream-400/20 shadow-[0_0_0_1px_rgba(212,180,131,0.08)]"
  )}>
    {isTop && (
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cream-400/10 blur-3xl" />
    )}

    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={cx(
            "text-[10px] font-mono uppercase tracking-[0.2em]",
            isTop ? "text-cream-400" : "text-ink-500"
          )}>
            #{rank}
          </span>
          {isTop && <Crown size={12} className="fill-cream-400 text-cream-400" />}
        </div>
        <h3 className="display mt-0.5 text-xl text-ink-100">{stat.model}</h3>
      </div>
      <div className="text-right">
        <div className={cx(
          "font-mono text-3xl font-light leading-none",
          isTop ? "text-cream-300" : "text-ink-200"
        )}>
          {stat.avgOverall > 0 ? stat.avgOverall.toFixed(1) : "—"}
        </div>
        <div className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-ink-500">ort. puan</div>
      </div>
    </div>

    <div className="space-y-1.5 rounded-xl border border-white/[0.05] bg-ink-900/40 p-3">
      <RatingBar label="Genel" value={Math.round(stat.avgOverall * 10) / 10} tone={isTop ? "cream" : "wine"} />
      <RatingBar label="Yüz" value={Math.round(stat.avgFace * 10) / 10} tone="cream" />
      <RatingBar label="Gerçek" value={Math.round(stat.avgRealism * 10) / 10} />
      <RatingBar label="Kıyafet" value={Math.round(stat.avgOutfit * 10) / 10} />
    </div>

    <div className="flex flex-wrap items-center gap-1.5">
      <span className="chip">{stat.total} sonuç</span>
      {stat.grids > 0 && (
        <span className="chip inline-flex items-center gap-1">
          <Grid2X2 size={9} /> {stat.grids} grid
        </span>
      )}
      {stat.winners > 0 && (
        <span className="chip-cream inline-flex items-center gap-1">
          <Crown size={9} className="fill-cream-400" /> {stat.winners} kazanan
        </span>
      )}
    </div>

    <Link
      to={`/results?model=${encodeURIComponent(stat.model)}`}
      className="btn mt-auto w-full justify-center opacity-0 transition group-hover:opacity-100"
    >
      Sonuçları gör <ArrowUpRight size={13} />
    </Link>
  </div>
);
