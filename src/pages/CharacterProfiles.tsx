import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Brain,
  Copy,
  Crown,
  GalleryHorizontal,
  Grid2X2,
  ImagePlus,
  Plus,
  Send,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useStudio } from "../hooks/useStudio";
import { useToast } from "../hooks/useToast";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Toggle } from "../components/Toggle";
import { ResultEditor } from "../components/ResultEditor";
import { ResultThumb } from "../components/ResultThumb";
import { ResultCard } from "../components/ResultCard";
import { ResultLightbox } from "../components/ResultLightbox";
import {
  defaultInclude,
  defaultMemory,
  MEMORY_FIELDS,
  RESULT_TYPES,
  RESULT_TYPE_LABEL,
  type CharacterMemoryKey,
  type CharacterProfile,
  type ResultType,
} from "../types";
import { copyText } from "../utils/clipboard";

type CharDraft = Omit<CharacterProfile, "id" | "createdAt" | "updatedAt">;
type CharTextField = Exclude<keyof CharDraft, "name" | "memory" | "include">;

const NOTE_FIELDS: { k: CharTextField; label: string; rows: number }[] = [
  { k: "overview", label: "Genel görünüm", rows: 3 },
  { k: "faceHair", label: "Yüz / saç / gözlük (özet)", rows: 3 },
  { k: "body", label: "Vücut tipi", rows: 2 },
  { k: "signatureOutfit", label: "Kıyafet imzası (özet)", rows: 2 },
  { k: "locations", label: "Mekan tercihleri", rows: 2 },
  { k: "cameraStyle", label: "Kamera stili (özet)", rows: 2 },
  { k: "keepFeatures", label: "Korunması gereken", rows: 2 },
  { k: "avoidFeatures", label: "Kaçınılması gereken (özet)", rows: 2 },
];

const blank = (preset?: Partial<CharacterProfile>): CharDraft => ({
  name: preset?.name ?? "",
  overview: preset?.overview ?? "",
  faceHair: preset?.faceHair ?? "",
  body: preset?.body ?? "",
  signatureOutfit: preset?.signatureOutfit ?? "",
  locations: preset?.locations ?? "",
  cameraStyle: preset?.cameraStyle ?? "",
  keepFeatures: preset?.keepFeatures ?? "",
  avoidFeatures: preset?.avoidFeatures ?? "",
  memory: { ...defaultMemory(), ...(preset?.memory ?? {}) },
  include: { ...defaultInclude(), ...(preset?.include ?? {}) },
  mainPrompt: preset?.mainPrompt ?? "",
});

export const CharacterProfiles = () => {
  const { characters, results, prompts, addCharacter, updateCharacter, removeCharacter, removeResult, toggleResultFavorite } = useStudio();
  const { push } = useToast();
  const nav = useNavigate();

  const [activeId, setActiveId] = useState<string | null>(characters[0]?.id ?? null);
  const [draft, setDraft] = useState<CharDraft>(() => blank(characters[0]));
  const [isNew, setIsNew] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [resultEditor, setResultEditor] = useState<{ open: boolean; resultId: string | null }>({
    open: false,
    resultId: null,
  });
  const [resultTypeFilter, setResultTypeFilter] = useState<ResultType | "all">("all");
  const [resultFavOnly, setResultFavOnly] = useState(false);
  const [lightbox, setLightbox] = useState<{ open: boolean; id: string | null; vIndex: number | null }>({
    open: false,
    id: null,
    vIndex: null,
  });
  const [confirmDeleteResult, setConfirmDeleteResult] = useState<string | null>(null);

  const linkedResults = useMemo(
    () => (activeId ? results.filter((r) => r.characterId === activeId) : []),
    [results, activeId]
  );
  const promptLookup = useMemo(() => Object.fromEntries(prompts.map((p) => [p.id, p.title])), [prompts]);

  const filteredResults = useMemo(() => {
    let list = [...linkedResults];
    if (resultFavOnly) list = list.filter((r) => r.favorite);
    if (resultTypeFilter !== "all") list = list.filter((r) => r.resultType === resultTypeFilter);
    list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return list;
  }, [linkedResults, resultFavOnly, resultTypeFilter]);

  const stats = useMemo(() => {
    if (linkedResults.length === 0) {
      return { total: 0, favs: 0, grids: 0, winners: 0, avgOverall: 0, avgFace: 0, topModel: "" };
    }
    const grids = linkedResults.filter((r) => r.resultType === "grid");
    const winners = grids.reduce((s, r) => s + r.variations.filter((v) => v.isWinner).length, 0);
    const sumOverall = linkedResults.reduce((s, r) => s + r.overall, 0);
    const sumFace = linkedResults.reduce((s, r) => s + r.faceConsistency, 0);
    const modelTally = linkedResults.reduce<Record<string, number>>((acc, r) => {
      acc[r.model] = (acc[r.model] ?? 0) + 1;
      return acc;
    }, {});
    const topModel = Object.entries(modelTally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    return {
      total: linkedResults.length,
      favs: linkedResults.filter((r) => r.favorite).length,
      grids: grids.length,
      winners,
      avgOverall: Math.round((sumOverall / linkedResults.length) * 10) / 10,
      avgFace: Math.round((sumFace / linkedResults.length) * 10) / 10,
      topModel,
    };
  }, [linkedResults]);

  const topResults = useMemo(
    () =>
      [...linkedResults]
        .sort(
          (a, b) =>
            b.overall + b.faceConsistency - (a.overall + a.faceConsistency)
        )
        .slice(0, 3),
    [linkedResults]
  );

  const active = useMemo(
    () => (isNew ? null : characters.find((c) => c.id === activeId) ?? null),
    [characters, activeId, isNew]
  );

  const startNew = () => {
    setIsNew(true);
    setActiveId(null);
    setDraft(blank());
  };

  const selectChar = (c: CharacterProfile) => {
    setIsNew(false);
    setActiveId(c.id);
    setDraft(blank(c));
  };

  const set = <K extends CharTextField | "name" | "mainPrompt">(k: K, v: string) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const setMemoryField = (k: CharacterMemoryKey, v: string) =>
    setDraft((d) => ({ ...d, memory: { ...d.memory, [k]: v } }));

  const setIncludeField = (k: CharacterMemoryKey, v: boolean) =>
    setDraft((d) => ({ ...d, include: { ...d.include, [k]: v } }));

  const save = () => {
    if (!draft.name.trim()) {
      push("Önce bir isim girelim", "danger");
      return;
    }
    if (isNew) {
      const created = addCharacter(draft);
      setIsNew(false);
      setActiveId(created.id);
      push("Karakter eklendi", "success");
    } else if (active) {
      updateCharacter(active.id, draft);
      push("Karakter güncellendi", "success");
    }
  };

  const handleCopy = async () => {
    const ok = await copyText(draft.mainPrompt);
    push(ok ? "Karakter promptu kopyalandı" : "Kopyalanamadı", ok ? "success" : "danger");
  };

  const sendToBuilder = () => {
    if (!active) {
      push("Önce karakteri kaydet", "danger");
      return;
    }
    nav("/builder", { state: { characterId: active.id } });
  };

  const confirmDelete = () => {
    if (!confirmId) return;
    removeCharacter(confirmId);
    push("Karakter silindi");
    setConfirmId(null);
    if (activeId === confirmId) {
      const next = characters.find((c) => c.id !== confirmId) ?? null;
      if (next) selectChar(next);
      else startNew();
    }
  };

  const activeMemoryCount = MEMORY_FIELDS.filter(
    (f) => draft.include[f.key] && draft.memory[f.key].trim() !== ""
  ).length;

  return (
    <div className="grid flex-1 gap-6 px-6 pb-28 pt-7 sm:px-10 lg:grid-cols-[280px_1fr]">
      <aside className="card animate-fade-up p-3 lg:sticky lg:top-24 lg:h-fit">
        <button onClick={startNew} className="btn-primary mb-3 w-full"><Plus size={15} /> Yeni karakter</button>
        <div className="flex flex-col gap-0.5">
          {characters.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-ink-400">
              Henüz karakter yok.
            </div>
          )}
          {characters.map((c) => {
            const isActive = c.id === activeId && !isNew;
            return (
              <div
                key={c.id}
                className={
                  "group relative flex items-center gap-2 rounded-xl pr-2 transition-all " +
                  (isActive
                    ? "bg-ink-800/70 text-ink-100"
                    : "text-ink-300 hover:bg-ink-800/40 hover:text-ink-100")
                }
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/4 h-1/2 w-0.5 rounded-r-full bg-gradient-to-b from-cream-400 to-wine-400"
                    aria-hidden
                  />
                )}
                <button
                  onClick={() => selectChar(c)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-ink-900/60 text-[11px] font-mono text-cream-400/90">
                    {c.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block w-full truncate text-sm">{c.name}</span>
                    <span className="block w-full truncate text-[10px] uppercase tracking-[0.18em] text-ink-500">
                      {c.signatureOutfit.split(",")[0] || "imza yok"}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setConfirmId(c.id)}
                  className="shrink-0 rounded-md p-1.5 text-ink-500 opacity-0 transition group-hover:opacity-100 hover:bg-ink-800 hover:text-red-300 focus:opacity-100"
                  aria-label={`${c.name} karakterini sil`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {!active && !isNew ? (
        <EmptyState
          icon={<Users size={20} />}
          title="Bir karakter seç"
          description="Sol taraftan bir karakter aç ya da yeni bir tane oluştur."
        />
      ) : (
        <div className="space-y-6 animate-fade-up">
          <div className="card relative overflow-hidden p-6 sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-wine-500/20 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.32em] text-cream-400/80">karakter</div>
                <input
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Karakter adı"
                  className="display mt-1 w-full border-none bg-transparent text-3xl text-ink-100 outline-none placeholder:text-ink-600 focus:outline-none sm:text-[40px]"
                />
                <div className="mt-2 inline-flex items-center gap-2 text-[11px] text-ink-400">
                  <Brain size={12} className="text-cream-400" />
                  {activeMemoryCount} hafıza alanı aktif
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={handleCopy} className="btn"><Copy size={15} /> <span className="hidden sm:inline">Kopyala</span></button>
                <button onClick={sendToBuilder} className="btn"><Send size={15} /> <span className="hidden sm:inline">Builder'a gönder</span></button>
                <button onClick={save} className="btn-primary">Kaydet</button>
              </div>
            </div>
          </div>

          {/* MEMORY SECTION */}
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[10.5px] uppercase tracking-[0.32em] text-cream-400/80">karakter hafızası</div>
                <h2 className="display mt-1.5 text-2xl text-ink-100">Builder'a otomatik enjekte edilecek</h2>
                <p className="mt-1 text-xs text-ink-400">
                  Her alanı ayrı ayrı aç/kapa. "Kaçınılacaklar" otomatik olarak negatif prompta gider.
                </p>
              </div>
              <div className="hidden text-right text-[11px] text-ink-500 sm:block">
                {Object.values(draft.include).filter(Boolean).length} / {MEMORY_FIELDS.length} açık
              </div>
            </div>

            <div className="stagger grid gap-4 xl:grid-cols-2">
              {MEMORY_FIELDS.map((field) => {
                const enabled = draft.include[field.key];
                return (
                  <div
                    key={field.key}
                    className={
                      "card relative overflow-hidden p-5 transition-opacity " +
                      (enabled ? "opacity-100" : "opacity-55")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-ink-200">
                            {field.label}
                          </div>
                          {field.targetsNegative && (
                            <span className="chip border-red-500/35 bg-red-500/10 text-red-200">
                              negatife
                            </span>
                          )}
                        </div>
                        {field.description && (
                          <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                            {field.description}
                          </p>
                        )}
                      </div>
                      <Toggle
                        checked={enabled}
                        onChange={(v) => setIncludeField(field.key, v)}
                        label={enabled ? "dahil" : "kapalı"}
                      />
                    </div>
                    <textarea
                      className="input mt-3 font-mono text-[12.5px] leading-relaxed"
                      rows={3}
                      placeholder={field.placeholder}
                      value={draft.memory[field.key]}
                      onChange={(e) => setMemoryField(field.key, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAIN PROMPT */}
          <div className="card relative overflow-hidden p-6 sm:p-7">
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-plum-400/15 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="step-num">★</span>
                  <div className="display text-lg text-ink-100">Ana karakter promptu</div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-ink-500">
                  {draft.mainPrompt.length} karakter
                </span>
              </div>
              <textarea
                className="input mt-4 font-mono text-[13px] leading-relaxed"
                rows={5}
                value={draft.mainPrompt}
                onChange={(e) => set("mainPrompt", e.target.value)}
                placeholder="Bu karakter için temel prompt — Builder onu otomatik kullanır."
              />
              <p className="mt-3 text-[11px] leading-relaxed text-ink-500">
                Builder'da bu karakter seçildiğinde önce ana prompt eklenir, sonra yukarıdaki "dahil" işaretli
                hafıza alanları virgülle birleştirilerek arkasına yapıştırılır.
              </p>
            </div>
          </div>

          {/* BAĞLI SONUÇLAR */}
          {active && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-[10.5px] uppercase tracking-[0.32em] text-cream-400/80">galeri</div>
                  <h3 className="display mt-1.5 text-xl text-ink-100">Bu karaktere bağlı sonuçlar</h3>
                  <p className="mt-1 text-xs text-ink-500">
                    {linkedResults.length === 0
                      ? "Henüz bağlı sonuç yok — bir deneme ekleyerek başarıyı takip etmeye başla."
                      : `${linkedResults.length} sonuç kayıtlı.`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {linkedResults.length > 0 && (
                    <Link
                      to={`/results?character=${active.id}`}
                      className="btn"
                      title="Bu karakterin tüm sonuçlarını galeride aç"
                    >
                      <GalleryHorizontal size={15} />
                      <span className="hidden sm:inline">Galeride aç</span>
                      <ArrowUpRight size={12} className="text-ink-400" />
                    </Link>
                  )}
                  <button onClick={() => setResultEditor({ open: true, resultId: null })} className="btn-primary">
                    <ImagePlus size={15} /> Sonuç ekle
                  </button>
                </div>
              </div>

              {linkedResults.length > 0 && (
                <div className="card relative overflow-hidden p-5">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-wine-500/20 blur-3xl" />
                  <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    <StatTile label="toplam" value={String(stats.total)} hint={stats.topModel ? `çoğu ${stats.topModel}` : undefined} />
                    <StatTile
                      label="favori"
                      value={String(stats.favs)}
                      icon={<Star size={11} className="fill-cream-400 text-cream-400" />}
                    />
                    <StatTile
                      label="grid"
                      value={String(stats.grids)}
                      icon={<Grid2X2 size={11} className="text-cream-300" />}
                    />
                    <StatTile
                      label="winner"
                      value={String(stats.winners)}
                      icon={<Crown size={11} className="fill-cream-400 text-cream-400" />}
                    />
                    <StatTile label="genel ort." value={stats.avgOverall > 0 ? `${stats.avgOverall}★` : "—"} />
                    <StatTile label="yüz ort." value={stats.avgFace > 0 ? `${stats.avgFace}★` : "—"} />
                  </div>
                </div>
              )}

              {topResults.length > 0 && (
                <div className="card relative overflow-hidden p-5">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cream-400/10 blur-3xl" />
                  <div className="relative">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="chip-cream">★ en başarılı</span>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-ink-500">
                        genel + yüz puanına göre
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {topResults.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setLightbox({ open: true, id: r.id, vIndex: null })}
                          className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-ink-900/50 p-3 text-left transition hover:border-cream-400/30 hover:bg-ink-850"
                        >
                          <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl">
                            <ResultThumb src={r.imageUrl} alt={r.title} aspect="portrait" fit={r.fitMode} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-1 text-sm text-ink-100 group-hover:text-cream-400">
                              {r.title}
                            </div>
                            <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-500">
                              {r.model} · genel {r.overall}/5 · yüz {r.faceConsistency}/5
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {linkedResults.length > 0 && (
                <div className="card flex flex-wrap items-center gap-2 p-3">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-ink-500">filtre</span>
                  <select
                    value={resultTypeFilter}
                    onChange={(e) => setResultTypeFilter(e.target.value as ResultType | "all")}
                    className="rounded-full border border-white/[0.06] bg-ink-850/60 px-3 py-1.5 text-[11.5px] text-ink-300 outline-none transition focus:border-wine-400/55"
                  >
                    <option value="all">tüm türler</option>
                    {RESULT_TYPES.map((t) => (
                      <option key={t} value={t}>{RESULT_TYPE_LABEL[t].toLowerCase()}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setResultFavOnly((v) => !v)}
                    className={
                      "chip flex items-center gap-1.5 transition " +
                      (resultFavOnly ? "!border-cream-400/45 !bg-cream-400/10 !text-cream-400" : "hover:!text-ink-100")
                    }
                  >
                    <Star size={11} strokeWidth={1.6} className={resultFavOnly ? "fill-cream-400" : ""} />
                    favoriler
                  </button>
                  {(resultTypeFilter !== "all" || resultFavOnly) && (
                    <button
                      onClick={() => { setResultTypeFilter("all"); setResultFavOnly(false); }}
                      className="text-[11px] uppercase tracking-[0.16em] text-ink-500 underline-offset-4 hover:text-ink-200 hover:underline"
                    >
                      temizle
                    </button>
                  )}
                  <span className="ml-auto text-[11px] text-ink-500">{filteredResults.length} eşleşme</span>
                </div>
              )}

              {filteredResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredResults.map((r) => (
                    <ResultCard
                      key={r.id}
                      result={r}
                      density="comfortable"
                      promptTitle={r.promptId ? promptLookup[r.promptId] : undefined}
                      onSelect={() => setLightbox({ open: true, id: r.id, vIndex: null })}
                      onExpand={() => setLightbox({ open: true, id: r.id, vIndex: null })}
                      onEdit={() => setResultEditor({ open: true, resultId: r.id })}
                      onDelete={() => setConfirmDeleteResult(r.id)}
                      onToggleFavorite={() => toggleResultFavorite(r.id)}
                    />
                  ))}
                </div>
              ) : linkedResults.length > 0 ? (
                <div className="card p-6 text-center text-sm text-ink-400">
                  Bu filtrede sonuç yok — filtreyi gevşet ya da temizle.
                </div>
              ) : null}
            </div>
          )}

          {/* GENEL NOTLAR (biyografi) */}
          <div className="space-y-4">
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.32em] text-ink-400">genel notlar</div>
              <h3 className="display mt-1.5 text-xl text-ink-100">Yardımcı biyografi</h3>
              <p className="mt-1 text-xs text-ink-500">
                Bu alanlar prompta enjekte edilmez — kendine hatırlatmak için.
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {NOTE_FIELDS.map((field) => (
                <div key={field.k} className="card p-5">
                  <label className="label">{field.label}</label>
                  <textarea
                    className="input"
                    rows={field.rows}
                    value={draft[field.k]}
                    onChange={(e) => set(field.k, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="Bu karakteri silmek istediğine emin misin?"
        message="Bu işlem geri alınamaz."
        confirmLabel="Evet, sil"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />

      <ResultEditor
        open={resultEditor.open}
        resultId={resultEditor.resultId}
        prefill={{ characterId: activeId }}
        onClose={() => setResultEditor({ open: false, resultId: null })}
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
            setResultEditor({ open: true, resultId: id });
          }
        }}
      />

      <ConfirmDialog
        open={!!confirmDeleteResult}
        title="Bu sonucu silmek istediğine emin misin?"
        message="Bu işlem geri alınamaz."
        confirmLabel="Evet, sil"
        danger
        onConfirm={() => {
          if (confirmDeleteResult) {
            removeResult(confirmDeleteResult);
            push("Sonuç silindi");
            setConfirmDeleteResult(null);
          }
        }}
        onCancel={() => setConfirmDeleteResult(null)}
      />
    </div>
  );
};

const StatTile = ({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-white/[0.05] bg-ink-900/45 px-3 py-2.5">
    <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.22em] text-ink-500">
      {icon}
      {label}
    </div>
    <div className="display mt-1 text-xl text-ink-100">{value}</div>
    {hint && <div className="mt-0.5 text-[10px] text-ink-500">{hint}</div>}
  </div>
);
