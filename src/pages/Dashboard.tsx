import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GalleryHorizontal, Library, ScanFace, Sparkles, Users } from "lucide-react";
import { useStudio } from "../hooks/useStudio";
import { StatCard } from "../components/StatCard";
import { ResultThumb } from "../components/ResultThumb";
import { RatingBar } from "../components/RatingBar";
import { ResultLightbox } from "../components/ResultLightbox";
import { ResultEditor } from "../components/ResultEditor";
import { pickIdeaForToday } from "../data/ideas";
import { formatRelative } from "../utils/dates";

export const Dashboard = () => {
  const { prompts, characters, results } = useStudio();

  const [lightbox, setLightbox] = useState<{ open: boolean; id: string | null; vIndex: number | null }>({
    open: false, id: null, vIndex: null,
  });
  const [editor, setEditor] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const openLightbox = (id: string) => setLightbox({ open: true, id, vIndex: null });
  const closeLightbox = () => setLightbox({ open: false, id: null, vIndex: null });
  const lightboxResult = lightbox.id ? results.find((r) => r.id === lightbox.id) ?? null : null;
  const favorites = prompts.filter((p) => p.favorite);
  const recent = [...prompts]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 5);

  const ratedResults = results.filter((r) => r.faceConsistency > 0);
  const avgFace =
    ratedResults.length === 0
      ? 0
      : ratedResults.reduce((s, r) => s + r.faceConsistency, 0) / ratedResults.length;
  const avgFaceText = avgFace.toFixed(1);

  const topResults = [...results]
    .sort((a, b) => b.overall + b.faceConsistency - (a.overall + a.faceConsistency))
    .slice(0, 3);

  const recentResults = [...results]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="space-y-10">
      <section className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Toplam Prompt" value={prompts.length} Icon={Library} tone="default" />
        <StatCard label="Karakterler" value={characters.length} Icon={Users} tone="wine" />
        <StatCard label="Galeri" value={results.length} Icon={GalleryHorizontal} tone="cream" />
        <StatCard
          label="Ortalama Yüz"
          value={ratedResults.length === 0 ? "—" : avgFaceText}
          Icon={ScanFace}
          tone="default"
          hint={ratedResults.length === 0 ? "puanlı sonuç henüz yok" : `${ratedResults.length} sonuçta`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card card-hover lg:col-span-2 relative overflow-hidden p-7 sm:p-9 animate-fade-up">
          <div className="pointer-events-none absolute -right-40 -top-40 h-72 w-72 rounded-full bg-wine-500/35 blur-3xl animate-drift" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-plum-400/25 blur-3xl" />
          <div className="relative">
            <div className="chip-cream mb-4">
              <span className="inline-block h-1 w-1 rounded-full bg-cream-400" />
              bugünün fikri
            </div>
            <h2 className="display text-3xl leading-[1.05] text-ink-100 sm:text-[40px] text-balance">
              {pickIdeaForToday()}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-400">
              Her gün küçük bir öneri. Hoşuna giderse Builder'da hızlı bir prompt'a dönüştür,
              beğenirsen kütüphaneye kaydet.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/builder" className="btn-primary">
                Builder'ı aç
                <ArrowRight size={15} />
              </Link>
              <Link to="/editor" className="btn">
                Yeni boş prompt
              </Link>
            </div>
          </div>
        </div>

        <div className="card p-6 animate-fade-up" style={{ animationDelay: "0.08s" }}>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="display text-lg text-ink-100">Son Güncelleme</div>
              <p className="mt-0.5 text-xs text-ink-400">Yakın zamanda dokunduğun promptlar</p>
            </div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-ink-500">{recent.length}</span>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            {recent.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-ink-400">
                Henüz prompt yok. Yeni bir tane ekle.
              </div>
            )}
            {recent.map((p) => (
              <Link
                key={p.id}
                to={`/editor/${p.id}`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all hover:border-white/[0.06] hover:bg-ink-800/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink-100">{p.title}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {p.category} · {formatRelative(p.updatedAt)}
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-200"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="animate-fade-up" style={{ animationDelay: "0.12s" }}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.32em] text-cream-400/80">galeri</div>
            <div className="display mt-1.5 text-2xl text-ink-100">Son denemeler</div>
            <p className="mt-1 text-xs text-ink-400">En yüksek puanlılar ve en yeniler — birinden başla.</p>
          </div>
          <Link to="/results" className="btn-ghost">
            Galeriye git <ArrowRight size={14} />
          </Link>
        </div>
        {results.length === 0 ? (
          <div className="card rounded-2xl border border-dashed border-white/[0.08] p-10 text-center text-sm text-ink-400">
            Galeri henüz boş — bir prompt dene ve sonucunu buraya ekle.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card relative overflow-hidden p-5">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cream-400/12 blur-3xl" />
              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <span className="chip-cream">★ en yüksek puan</span>
                </div>
                <div className="space-y-2">
                  {topResults.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => openLightbox(r.id)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-ink-900/40 p-2.5 text-left transition hover:border-cream-400/25 hover:bg-ink-850"
                    >
                      <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg">
                        <ResultThumb src={r.imageUrl} alt={r.title} aspect="portrait" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm text-ink-100 group-hover:text-cream-400">{r.title}</div>
                        <div className="mt-1">
                          <RatingBar label="Genel" value={r.overall} tone="wine" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="chip-wine"><Sparkles size={11} /> son eklenen</span>
              </div>
              <div className="space-y-2">
                {recentResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => openLightbox(r.id)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-left transition hover:border-white/[0.05] hover:bg-ink-800/40"
                  >
                    <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg">
                      <ResultThumb src={r.imageUrl} alt={r.title} aspect="portrait" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-sm text-ink-100 group-hover:text-cream-400">{r.title}</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                        {r.model} · {formatRelative(r.createdAt)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="animate-fade-up" style={{ animationDelay: "0.18s" }}>
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.32em] text-cream-400/80">favoriler</div>
            <div className="display mt-1.5 text-2xl text-ink-100">Favori promptların</div>
            <p className="mt-1 text-xs text-ink-400">Yıldızladıkların burada — hep elinin altında.</p>
          </div>
          <Link to="/library?fav=1" className="btn-ghost">
            Hepsini gör <ArrowRight size={14} />
          </Link>
        </div>
        <div className="stagger grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {favorites.slice(0, 6).map((p) => (
            <Link
              key={p.id}
              to={`/editor/${p.id}`}
              className="card card-hover group p-5"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="chip-wine">{p.category}</span>
              </div>
              <div className="display line-clamp-1 text-lg text-ink-100 group-hover:text-cream-400">
                {p.title}
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-400">
                {p.description}
              </p>
            </Link>
          ))}
          {favorites.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-ink-400">
              Henüz favori yok. Prompt kartının üst sağındaki yıldıza basabilirsin.
            </div>
          )}
        </div>
      </section>
      <ResultLightbox
        open={lightbox.open}
        result={lightboxResult}
        variationIndex={lightbox.vIndex}
        onClose={closeLightbox}
        onShowWhole={() => setLightbox((l) => ({ ...l, vIndex: null }))}
        onFocusVariation={(i) => setLightbox((l) => ({ ...l, vIndex: i }))}
        onPrevVariation={() => {
          if (!lightboxResult || lightbox.vIndex === null) return;
          const n = lightboxResult.variations.length;
          setLightbox((l) => ({ ...l, vIndex: (l.vIndex! - 1 + n) % n }));
        }}
        onNextVariation={() => {
          if (!lightboxResult || lightbox.vIndex === null) return;
          const n = lightboxResult.variations.length;
          setLightbox((l) => ({ ...l, vIndex: (l.vIndex! + 1) % n }));
        }}
        onEdit={() => {
          if (lightbox.id) {
            const id = lightbox.id;
            closeLightbox();
            setEditor({ open: true, id });
          }
        }}
      />
      <ResultEditor
        open={editor.open}
        resultId={editor.id}
        onClose={() => setEditor({ open: false, id: null })}
      />
    </div>
  );
};

