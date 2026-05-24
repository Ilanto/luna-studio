import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Columns2, Crown, GalleryHorizontal, Plus, Star, X } from "lucide-react";
import { useStudio } from "../hooks/useStudio";
import { useToast } from "../hooks/useToast";
import { ResultCard } from "../components/ResultCard";
import { WinnerCard } from "../components/WinnerCard";
import { ResultEditor } from "../components/ResultEditor";
import { ResultDetailPanel } from "../components/ResultDetailPanel";
import { ResultLightbox } from "../components/ResultLightbox";
import { CompareModal } from "../components/CompareModal";
import { ViewDensityToggle, type Density } from "../components/ViewDensityToggle";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AI_MODELS, RESULT_STATUSES, RESULT_STATUS_LABEL, RESULT_TYPES, RESULT_TYPE_LABEL, type AIModel, type ResultStatus, type ResultType } from "../types";

type SortKey = "date" | "overall" | "face" | "title";

const DENSITY_KEY = "luna-studio:ui:density";

const DENSITY_GRID: Record<Density, { min: string; gap: string }> = {
  compact: { min: "180px", gap: "0.75rem" },
  comfortable: { min: "240px", gap: "1rem" },
  large: { min: "300px", gap: "1.25rem" },
};

const readDensity = (): Density => {
  try {
    const v = localStorage.getItem(DENSITY_KEY);
    if (v === "compact" || v === "comfortable" || v === "large") return v;
  } catch {}
  return "comfortable";
};

export const ResultGallery = () => {
  const { results, prompts, characters, removeResult, toggleResultFavorite, updateResult } = useStudio();

  const { push } = useToast();
  const [searchParams] = useSearchParams();

  const [characterFilter, setCharacterFilter] = useState<string>(searchParams.get("character") ?? "all");
  const [promptFilter, setPromptFilter] = useState<string>(searchParams.get("prompt") ?? "all");
  const [modelFilter, setModelFilter] = useState<AIModel | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ResultType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ResultStatus | "all">("all");
  const [favOnly, setFavOnly] = useState(false);
  const [winnersOnly, setWinnersOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("date");
  const [density, setDensity] = useState<Density>(() => readDensity());

  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleCompareMode = () => {
    setCompareMode((v) => {
      if (v) setCompareIds([]);
      return !v;
    });
  };

  const toggleCompareId = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ open: boolean; id: string | null; vIndex: number | null }>({
    open: false,
    id: null,
    vIndex: null,
  });
  const [editor, setEditor] = useState<{
    open: boolean;
    id: string | null;
    prefill?: { promptId?: string | null; characterId?: string | null };
  }>({ open: false, id: null });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(DENSITY_KEY, density);
    } catch {}
  }, [density]);

  const promptLookup = useMemo(() => Object.fromEntries(prompts.map((p) => [p.id, p])), [prompts]);
  const charLookup = useMemo(() => Object.fromEntries(characters.map((c) => [c.id, c])), [characters]);

  const filtered = useMemo(() => {
    let list = [...results];
    if (favOnly) list = list.filter((r) => r.favorite);
    if (characterFilter !== "all") list = list.filter((r) => r.characterId === characterFilter);
    if (promptFilter !== "all") list = list.filter((r) => r.promptId === promptFilter);
    if (modelFilter !== "all") list = list.filter((r) => r.model === modelFilter);
    if (typeFilter !== "all") list = list.filter((r) => r.resultType === typeFilter);
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    if (winnersOnly) {
      list = list.filter((r) => r.resultType === "grid" && r.variations.some((v) => v.isWinner));
    }
    list.sort((a, b) => {
      switch (sort) {
        case "overall": return b.overall - a.overall;
        case "face": return b.faceConsistency - a.faceConsistency;
        case "title": return a.title.localeCompare(b.title, "tr");
        case "date":
        default: return +new Date(b.createdAt) - +new Date(a.createdAt);
      }
    });
    return list;
  }, [results, favOnly, characterFilter, promptFilter, modelFilter, typeFilter, statusFilter, winnersOnly, sort]);

  useEffect(() => {
    if (filtered.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    const stillVisible = selectedId && filtered.some((r) => r.id === selectedId);
    if (!stillVisible) {
      setSelectedId(filtered.length === 1 ? filtered[0].id : null);
    }
  }, [filtered, selectedId]);

  const selected = useMemo(
    () => (selectedId ? results.find((r) => r.id === selectedId) ?? null : null),
    [results, selectedId]
  );

  const activeFilters =
    (favOnly ? 1 : 0) +
    (characterFilter !== "all" ? 1 : 0) +
    (promptFilter !== "all" ? 1 : 0) +
    (modelFilter !== "all" ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (winnersOnly ? 1 : 0);

  const resetFilters = () => {
    setFavOnly(false);
    setCharacterFilter("all");
    setPromptFilter("all");
    setModelFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setWinnersOnly(false);
  };

  const confirmDelete = () => {
    if (!confirmId) return;
    if (selectedId === confirmId) setSelectedId(null);
    removeResult(confirmId);
    setConfirmId(null);
    push("Sonuç silindi");
  };

  const openAddSimilar = () => {
    if (!selected) return;
    setEditor({
      open: true,
      id: null,
      prefill: { promptId: selected.promptId, characterId: selected.characterId },
    });
  };

  useEffect(() => {
    if (!selectedId || lightbox.open || editor.open || !!confirmId) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= 5) {
        updateResult(selectedId, { overall: n });
        push(`Genel puan → ${n}★`);
        return;
      }
      switch (e.key.toLowerCase()) {
        case "f":
          toggleResultFavorite(selectedId);
          push(selected?.favorite ? "Favoriden çıkarıldı" : "Favorilere eklendi");
          break;
        case "e":
          setEditor({ open: true, id: selectedId });
          break;
        case "arrowleft":
        case "arrowup": {
          e.preventDefault();
          const idx = filtered.findIndex((r) => r.id === selectedId);
          if (idx > 0) setSelectedId(filtered[idx - 1].id);
          break;
        }
        case "arrowright":
        case "arrowdown": {
          e.preventDefault();
          const idx = filtered.findIndex((r) => r.id === selectedId);
          if (idx < filtered.length - 1) setSelectedId(filtered[idx + 1].id);
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, lightbox.open, editor.open, confirmId, filtered, selected, updateResult, toggleResultFavorite, push]);

  const gridStyle = {
    gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${DENSITY_GRID[density].min}), 1fr))`,
    gap: DENSITY_GRID[density].gap,
  } as React.CSSProperties;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.05] bg-ink-950/30 px-6 pb-5 pt-2 sm:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.22em] text-ink-500">galeri</span>
          <span className="chip">{results.length} sonuç</span>
          {activeFilters > 0 && (
            <span className="chip-wine">{filtered.length} eşleşme</span>
          )}
        </div>
        <button onClick={() => setEditor({ open: true, id: null })} className="btn-primary">
          <Plus size={15} /> Yeni sonuç
        </button>
      </div>

      <div className="grid flex-1 gap-6 px-6 pb-28 pt-6 sm:px-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <div className="card grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                value={characterFilter}
                onChange={setCharacterFilter}
                options={[{ value: "all", label: "tüm karakterler" }, ...characters.map((c) => ({ value: c.id, label: c.name }))]}
              />
              <FilterSelect
                value={promptFilter}
                onChange={setPromptFilter}
                options={[{ value: "all", label: "tüm promptlar" }, ...prompts.map((p) => ({ value: p.id, label: p.title }))]}
              />
              <FilterSelect
                value={modelFilter}
                onChange={(v) => setModelFilter(v as AIModel | "all")}
                options={[{ value: "all", label: "tüm modeller" }, ...AI_MODELS.map((m) => ({ value: m, label: m }))]}
              />
              <FilterSelect
                value={typeFilter}
                onChange={(v) => setTypeFilter(v as ResultType | "all")}
                options={[
                  { value: "all", label: "tüm türler" },
                  ...RESULT_TYPES.map((t) => ({ value: t, label: RESULT_TYPE_LABEL[t].toLowerCase() })),
                ]}
              />
              <FilterSelect
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as ResultStatus | "all")}
                options={[
                  { value: "all", label: "tüm durumlar" },
                  ...RESULT_STATUSES.map((s) => ({ value: s, label: RESULT_STATUS_LABEL[s].toLowerCase() })),
                ]}
              />
              <button
                onClick={() => setFavOnly((v) => !v)}
                className={
                  "chip flex items-center gap-1.5 transition " +
                  (favOnly ? "!border-cream-400/45 !bg-cream-400/10 !text-cream-400" : "hover:!text-ink-100")
                }
              >
                <Star size={11} strokeWidth={1.6} className={favOnly ? "fill-cream-400" : ""} />
                favoriler
              </button>
              <button
                onClick={() => setWinnersOnly((v) => !v)}
                className={
                  "chip flex items-center gap-1.5 transition " +
                  (winnersOnly ? "!border-cream-400/45 !bg-cream-400/10 !text-cream-400" : "hover:!text-ink-100")
                }
                title="Sadece grid sonuçlarından winner V'leri göster"
              >
                <Crown size={11} strokeWidth={1.6} className={winnersOnly ? "fill-cream-400" : ""} />
                winners
              </button>
              {activeFilters > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] uppercase tracking-[0.16em] text-ink-500 underline-offset-4 hover:text-ink-200 hover:underline"
                >
                  temizle ({activeFilters})
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-full border border-white/[0.06] bg-ink-850/60 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-ink-300 outline-none focus:border-wine-400/55"
              >
                <option value="date">Tarih (yeni)</option>
                <option value="overall">Genel puan</option>
                <option value="face">Yüz puanı</option>
                <option value="title">Başlık (A→Z)</option>
              </select>
              <button
                onClick={toggleCompareMode}
                title="Karşılaştırma modu"
                className={
                  "chip flex items-center gap-1.5 transition " +
                  (compareMode ? "!border-plum-400/50 !bg-plum-500/15 !text-plum-200" : "hover:!text-ink-100")
                }
              >
                <Columns2 size={11} strokeWidth={1.6} />
                karşılaştır
              </button>
              <ViewDensityToggle value={density} onChange={setDensity} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={winnersOnly ? <Crown size={20} /> : <GalleryHorizontal size={20} />}
              title={
                results.length === 0
                  ? "Galeri henüz boş"
                  : winnersOnly
                  ? "Henüz kazanan bir varyasyon yok"
                  : "Bu filtrede sonuç yok"
              }
              description={
                results.length === 0
                  ? "İlk denemeni ekle — hangi promptun ne sonuç verdiğini hatırlamak için harika bir alışkanlık."
                  : winnersOnly
                  ? "Bir grid sonuç aç, varyasyonlar arasından bir tanesini taç ile kazanan seç. Buradan onları toplu izleyebilirsin."
                  : "Filtreleri gevşet ya da farklı bir karakter / model seç."
              }
              action={
                results.length === 0 ? (
                  <button onClick={() => setEditor({ open: true, id: null })} className="btn-primary">
                    <Plus size={15} /> İlk sonucu ekle
                  </button>
                ) : (
                  <button onClick={resetFilters} className="btn">
                    Filtreleri temizle
                  </button>
                )
              }
            />
          ) : (
            <div className="stagger grid" style={gridStyle}>
              {filtered.map((r) => {
                if (winnersOnly) {
                  const idx = r.variations.findIndex((v) => v.isWinner);
                  const winner = idx >= 0 ? r.variations[idx] : null;
                  if (!winner) return null;
                  return (
                    <WinnerCard
                      key={r.id}
                      result={r}
                      winner={winner}
                      winnerIndex={idx}
                      selected={r.id === selectedId}
                      promptTitle={r.promptId ? promptLookup[r.promptId]?.title : undefined}
                      characterName={r.characterId ? charLookup[r.characterId]?.name : undefined}
                      onSelect={() => setSelectedId(r.id)}
                      onExpand={() => setLightbox({ open: true, id: r.id, vIndex: idx })}
                      onEdit={() => setEditor({ open: true, id: r.id })}
                      onDelete={() => setConfirmId(r.id)}
                    />
                  );
                }
                const cIdx = compareIds.indexOf(r.id);
                return (
                  <ResultCard
                    key={r.id}
                    result={r}
                    density={density}
                    selected={!compareMode && r.id === selectedId}
                    compareIndex={cIdx >= 0 ? ((cIdx + 1) as 1 | 2) : undefined}
                    promptTitle={r.promptId ? promptLookup[r.promptId]?.title : undefined}
                    characterName={r.characterId ? charLookup[r.characterId]?.name : undefined}
                    onSelect={compareMode ? () => toggleCompareId(r.id) : () => setSelectedId(r.id)}
                    onExpand={() => setLightbox({ open: true, id: r.id, vIndex: null })}
                    onEdit={() => setEditor({ open: true, id: r.id })}
                    onDelete={() => setConfirmId(r.id)}
                    onToggleFavorite={() => toggleResultFavorite(r.id)}
                    onStatusChange={(next) => updateResult(r.id, { status: next })}
                  />
                );
              })}
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-2">
            {selectedId && !lightbox.open && !editor.open && (
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-1 py-1">
                {(["1-5", "F", "E", "←→"] as const).map((key, i) => {
                  const labels = ["puan ver", "favori", "düzenle", "gezin"];
                  return (
                    <span key={key} className="inline-flex items-center gap-1 text-[10px] tracking-[0.12em] text-ink-600">
                      <kbd className="rounded border border-white/[0.07] bg-ink-900/60 px-1 py-0.5 font-mono text-[9px] text-ink-400">{key}</kbd>
                      {labels[i]}
                    </span>
                  );
                })}
              </div>
            )}
            <ResultDetailPanel
              result={selected}
              prompt={selected?.promptId ? promptLookup[selected.promptId] : undefined}
              character={selected?.characterId ? charLookup[selected.characterId] : undefined}
              onEdit={() => selected && setEditor({ open: true, id: selected.id })}
              onAddSimilar={openAddSimilar}
              onExpand={() => selected && setLightbox({ open: true, id: selected.id, vIndex: null })}
              onFocusVariation={(idx) =>
                selected && setLightbox({ open: true, id: selected.id, vIndex: idx })
              }
              onDelete={() => selected && setConfirmId(selected.id)}
              onToggleFavorite={() => selected && toggleResultFavorite(selected.id)}
            />
          </div>

        </aside>
      </div>

      <ResultEditor
        open={editor.open}
        resultId={editor.id}
        prefill={editor.prefill}
        onClose={() => setEditor({ open: false, id: null })}
      />
      <ResultLightbox
        open={lightbox.open}
        result={lightbox.id ? results.find((r) => r.id === lightbox.id) ?? null : null}
        variationIndex={lightbox.vIndex}
        onClose={() => setLightbox({ open: false, id: null, vIndex: null })}
        onShowWhole={() => setLightbox((l) => ({ ...l, vIndex: null }))}
        onFocusVariation={(i) => setLightbox((l) => ({ ...l, vIndex: i }))}
        onPrevVariation={() => {
          const r = lightbox.id ? results.find((x) => x.id === lightbox.id) : null;
          if (!r || lightbox.vIndex === null) return;
          const n = r.variations.length;
          setLightbox((l) => ({ ...l, vIndex: (l.vIndex! - 1 + n) % n }));
        }}
        onNextVariation={() => {
          const r = lightbox.id ? results.find((x) => x.id === lightbox.id) : null;
          if (!r || lightbox.vIndex === null) return;
          const n = r.variations.length;
          setLightbox((l) => ({ ...l, vIndex: (l.vIndex! + 1) % n }));
        }}
        onEdit={() => {
          if (lightbox.id) {
            const id = lightbox.id;
            setLightbox({ open: false, id: null, vIndex: null });
            setEditor({ open: true, id });
          }
        }}
      />
      <ConfirmDialog
        open={!!confirmId}
        title="Bu sonucu silmek istediğine emin misin?"
        message="Bu işlem geri alınamaz."
        confirmLabel="Evet, sil"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />

      {compareMode && (
        <div className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-between gap-4 border-t border-plum-400/20 bg-ink-950/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={
                    "grid h-7 w-7 place-items-center rounded-full border font-mono text-[11px] transition " +
                    (i < compareIds.length
                      ? "border-plum-400/50 bg-plum-500/20 text-plum-200"
                      : "border-white/[0.08] bg-ink-900/40 text-ink-600")
                  }
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <span className="text-[11px] text-ink-400">
              {compareIds.length === 0
                ? "Karşılaştırmak için 2 sonuç seç"
                : compareIds.length === 1
                ? "Bir tane daha seç"
                : "Hazır — karşılaştır!"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {compareIds.length === 2 && (
              <button
                onClick={() => setCompareOpen(true)}
                className="btn-primary"
              >
                <Columns2 size={14} /> Karşılaştır
              </button>
            )}
            <button onClick={toggleCompareMode} className="btn-ghost" title="Karşılaştırma modunu kapat">
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      <CompareModal
        open={compareOpen}
        results={
          compareIds.length === 2
            ? ([results.find((r) => r.id === compareIds[0])!, results.find((r) => r.id === compareIds[1])!] as [typeof results[0], typeof results[0]])
            : null
        }
        prompts={promptLookup}
        characters={charLookup}
        onClose={() => setCompareOpen(false)}
        onEdit={(id) => { setCompareOpen(false); setEditor({ open: true, id }); }}
        onExpand={(id) => { setCompareOpen(false); setLightbox({ open: true, id, vIndex: null }); }}
      />
    </div>
  );
};

const FilterSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="rounded-full border border-white/[0.06] bg-ink-850/60 px-3 py-1.5 text-[11.5px] text-ink-300 outline-none transition focus:border-wine-400/55"
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);
