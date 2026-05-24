import { useEffect, useMemo, useRef, useState } from "react";
import { Crown, Grid2X2, GripVertical, ImageIcon, ImageUp, Save, Star, Trash2, Video, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStudio } from "../hooks/useStudio";
import { useToast } from "../hooks/useToast";
import { Stars } from "./Stars";
import { ResultThumb } from "./ResultThumb";
import { VariationThumb } from "./VariationThumb";
import {
  AI_MODELS,
  RESULT_STATUSES,
  RESULT_STATUS_LABEL,
  RESULT_TYPES,
  RESULT_TYPE_LABEL,
  defaultVariations,
  type AIModel,
  type FitMode,
  type ResultEntry,
  type ResultStatus,
  type ResultType,
  type Variation,
} from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { resizeImageFile } from "../utils/image";
import { cx } from "../utils/cx";

interface Props {
  open: boolean;
  resultId?: string | null;
  prefill?: { promptId?: string | null; characterId?: string | null };
  onClose: () => void;
}

type Draft = Omit<ResultEntry, "id" | "createdAt" | "updatedAt">;

const blank = (preset?: Partial<ResultEntry>): Draft => ({
  title: preset?.title ?? "",
  promptId: preset?.promptId ?? null,
  characterId: preset?.characterId ?? null,
  imageUrl: preset?.imageUrl ?? "",
  model: (preset?.model as AIModel) ?? "Midjourney",
  fitMode: (preset?.fitMode as FitMode) ?? "cover",
  resultType: (preset?.resultType as ResultType) ?? "single",
  variations: preset?.variations && preset.variations.length > 0
    ? preset.variations.map((v) => ({ ...v }))
    : [],
  variationNotes: preset?.variationNotes ?? "",
  overall: preset?.overall ?? 0,
  faceConsistency: preset?.faceConsistency ?? 0,
  realism: preset?.realism ?? 0,
  outfitAccuracy: preset?.outfitAccuracy ?? 0,
  notes: preset?.notes ?? "",
  issues: preset?.issues ?? "",
  favorite: preset?.favorite ?? false,
  status: preset?.status ?? null,
});

const TYPE_ICONS: Record<ResultType, typeof ImageIcon> = {
  single: ImageIcon,
  grid: Grid2X2,
  video: Video,
};

export const ResultEditor = ({ open, resultId, prefill, onClose }: Props) => {
  const { results, prompts, characters, addResult, updateResult, removeResult } = useStudio();
  const { push } = useToast();
  const existing = useMemo(
    () => (resultId ? results.find((r) => r.id === resultId) : undefined),
    [results, resultId]
  );

  const [draft, setDraft] = useState<Draft>(() =>
    blank(existing ?? { promptId: prefill?.promptId ?? null, characterId: prefill?.characterId ?? null })
  );
  const [confirmDel, setConfirmDel] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleVariationDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = draft.variations.findIndex((v) => v.id === active.id);
    const newIdx = draft.variations.findIndex((v) => v.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    set("variations", arrayMove(draft.variations, oldIdx, newIdx));
  };
  const [imgInfo, setImgInfo] = useState<{ sizeKb: number; w: number; h: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(
      blank(
        existing ?? {
          promptId: prefill?.promptId ?? null,
          characterId: prefill?.characterId ?? null,
        }
      )
    );
    setConfirmDel(false);
    setImgInfo(null);
  }, [open, existing, prefill?.promptId, prefill?.characterId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirmDel) onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, confirmDel]);

  if (!open) return null;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const handleFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      push("Dosya 20MB'den büyük — daha küçük bir resim seç", "danger");
      return;
    }
    try {
      const result = await resizeImageFile(file);
      set("imageUrl", result.dataUrl);
      setImgInfo({ sizeKb: result.sizeKb, w: result.width, h: result.height });
      push(`Resim yüklendi · ${result.sizeKb} KB`, "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Resim okunamadı";
      push(msg, "danger");
    }
  };

  const clearImage = () => {
    set("imageUrl", "");
    setImgInfo(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const save = () => {
    if (!draft.title.trim()) {
      push("Önce bir başlık yazalım", "danger");
      return;
    }
    if (existing) {
      updateResult(existing.id, draft);
      push("Sonuç güncellendi", "success");
    } else {
      addResult(draft);
      push("Sonuç eklendi", "success");
    }
    onClose();
  };

  const remove = () => {
    if (!existing) return;
    removeResult(existing.id);
    push("Sonuç silindi");
    setConfirmDel(false);
    onClose();
  };

  return (
    <>
    <div
      className="fixed inset-0 z-50 overflow-y-auto animate-fade-in bg-black/65 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
      <div
        className="card-raised relative z-10 my-4 w-full max-w-3xl animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-wine-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-plum-400/20 blur-3xl" />

        <div className="relative flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-cream-400/80">
              {existing ? "sonucu düzenle" : "yeni sonuç"}
            </div>
            <div className="display mt-1 text-2xl text-ink-100">
              {existing ? existing.title || "İsimsiz sonuç" : "Galeriye ekle"}
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" aria-label="Kapat">
            <X size={16} />
          </button>
        </div>

        <div className="relative grid gap-5 px-6 py-6 sm:grid-cols-[200px_1fr]">
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cx(
                "relative rounded-2xl transition-shadow",
                dragOver && "ring-2 ring-cream-400/60 ring-offset-2 ring-offset-ink-950"
              )}
            >
              <ResultThumb src={draft.imageUrl} alt={draft.title} aspect="portrait" fit={draft.fitMode} />
              {dragOver && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-ink-950/70 backdrop-blur-sm">
                  <div className="display text-lg text-cream-400">bırak, ben hallederim</div>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn flex-1 justify-center"
              >
                <ImageUp size={15} /> Bilgisayardan seç
              </button>
              {draft.imageUrl && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="btn text-ink-400 hover:text-red-300"
                  aria-label="Görseli kaldır"
                  title="Görseli kaldır"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            {imgInfo && (
              <div className="mt-2 text-[10.5px] text-cream-400/80">
                {imgInfo.w}×{imgInfo.h} · ~{imgInfo.sizeKb} KB
              </div>
            )}

            <div className="mt-3 flex items-center gap-1 rounded-full border border-white/[0.06] bg-ink-900/40 p-0.5">
              {(["cover", "contain"] as FitMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("fitMode", m)}
                  className={cx(
                    "flex-1 rounded-full px-2 py-1 text-[10.5px] uppercase tracking-[0.16em] transition",
                    draft.fitMode === m
                      ? "bg-wine-500/25 text-ink-100"
                      : "text-ink-400 hover:text-ink-200"
                  )}
                >
                  {m === "cover" ? "Doldur" : "Sığdır"}
                </button>
              ))}
            </div>

            <details className="group mt-2.5">
              <summary className="cursor-pointer text-[10.5px] uppercase tracking-[0.18em] text-ink-500 hover:text-ink-300">
                veya bir URL yapıştır
              </summary>
              <input
                className="input mt-2 text-[12.5px]"
                placeholder="https://..."
                value={draft.imageUrl.startsWith("data:") ? "" : draft.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
              />
            </details>

            <p className="mt-2.5 text-[10.5px] leading-relaxed text-ink-500">
              Resim seçince otomatik 1400px'e küçültülüp JPEG'e çevrilir — depolama dolmasın diye.
              Sürükle-bırak da çalışır.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Başlık</label>
              <input
                className="input"
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Örn: Luna — kafe v3"
              />
            </div>

            <div>
              <label className="label">Tür</label>
              <div className="flex flex-wrap items-center gap-1 rounded-full border border-white/[0.06] bg-ink-900/40 p-0.5">
                {RESULT_TYPES.map((t) => {
                  const Icon = TYPE_ICONS[t];
                  const active = draft.resultType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        if (t === "grid" && draft.variations.length === 0) {
                          set("variations", defaultVariations(4));
                        }
                        set("resultType", t);
                      }}
                      className={cx(
                        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] uppercase tracking-[0.12em] transition",
                        active
                          ? "bg-wine-500/25 text-ink-100 shadow-[inset_0_0_0_1px_rgba(140,58,82,0.45)]"
                          : "text-ink-400 hover:text-ink-200"
                      )}
                    >
                      <Icon size={13} strokeWidth={1.7} />
                      {RESULT_TYPE_LABEL[t]}
                    </button>
                  );
                })}
              </div>
              {draft.resultType === "grid" && (
                <p className="mt-2 rounded-xl border border-cream-400/15 bg-cream-400/[0.04] px-3 py-2 text-[11.5px] leading-relaxed text-cream-200/85">
                  Bu görsel 2×2 varyasyon grid'i ise her kareyi ayrı puanlayabilirsin.
                  Aşağıdaki "Varyasyonlar" başlığını aç.
                </p>
              )}
              {draft.resultType === "video" && (
                <p className="mt-2 rounded-xl border border-white/[0.06] bg-ink-900/40 px-3 py-2 text-[11.5px] leading-relaxed text-ink-400">
                  Video denemesi — görsel alanına ilk kareyi ya da poster görseli koyabilirsin.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Bağlı prompt</label>
                <select
                  className="input"
                  value={draft.promptId ?? ""}
                  onChange={(e) => set("promptId", e.target.value || null)}
                >
                  <option value="">— bağsız —</option>
                  {prompts.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Bağlı karakter</label>
                <select
                  className="input"
                  value={draft.characterId ?? ""}
                  onChange={(e) => set("characterId", e.target.value || null)}
                >
                  <option value="">— bağsız —</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Model / araç</label>
              <div className="flex flex-wrap gap-1.5">
                {AI_MODELS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set("model", m)}
                    className={
                      "rounded-full border px-3 py-1.5 text-[12px] transition active:scale-[0.97] " +
                      (draft.model === m
                        ? "border-wine-400/55 bg-wine-500/20 text-ink-100"
                        : "border-white/[0.06] bg-ink-900/40 text-ink-350 hover:text-ink-100 hover:border-white/[0.12]")
                    }
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-ink-900/40 p-4">
              <div className="mb-3 text-[10.5px] uppercase tracking-[0.22em] text-ink-400">
                {draft.resultType === "grid" ? "Genel puanlar (tüm grid)" : "Puanlar"}
              </div>
              <RatingRow label="Genel" value={draft.overall} onChange={(v) => set("overall", v)} />
              <RatingRow label="Yüz tutarlılığı" value={draft.faceConsistency} onChange={(v) => set("faceConsistency", v)} />
              <RatingRow label="Gerçekçilik" value={draft.realism} onChange={(v) => set("realism", v)} />
              <RatingRow label="Kıyafet doğruluğu" value={draft.outfitAccuracy} onChange={(v) => set("outfitAccuracy", v)} />
            </div>

            {draft.resultType === "grid" && (
              <details className="group rounded-2xl border border-white/[0.06] bg-ink-900/40 open:bg-ink-900/55">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Grid2X2 size={14} className="text-cream-400/80" />
                    <span className="text-[12px] uppercase tracking-[0.18em] text-ink-300">
                      Varyasyonlar
                    </span>
                    <span className="chip">{draft.variations.length}</span>
                    {draft.variations.some((v) => v.isWinner) && (
                      <span className="chip-cream">
                        <Crown size={10} className="mr-0.5 fill-cream-400" />
                        winner {draft.variations.find((v) => v.isWinner)?.label}
                      </span>
                    )}
                  </div>
                  <span className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 group-open:hidden">
                    aç
                  </span>
                  <span className="hidden text-[10.5px] uppercase tracking-[0.18em] text-ink-500 group-open:inline">
                    kapat
                  </span>
                </summary>
                <div className="space-y-3 border-t border-white/[0.05] px-4 py-4">
                  <div>
                    <label className="label">Grid hakkında not</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={draft.variationNotes}
                      onChange={(e) => set("variationNotes", e.target.value)}
                      placeholder="Genel olarak bu grid'de ne fark ettin?"
                    />
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleVariationDragEnd}
                  >
                    <SortableContext
                      items={draft.variations.map((v) => v.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {draft.variations.map((v, idx) => (
                          <SortableVariationCard
                            key={v.id}
                            v={v}
                            index={idx}
                            imageUrl={draft.imageUrl}
                            count={draft.variations.length}
                            onChange={(next) =>
                              set("variations", draft.variations.map((x) => (x.id === v.id ? next : x)))
                            }
                            onWinner={() =>
                              set(
                                "variations",
                                draft.variations.map((x) =>
                                  x.id === v.id
                                    ? { ...x, isWinner: !x.isWinner }
                                    : { ...x, isWinner: false }
                                )
                              )
                            }
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </details>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Notlar</label>
                <textarea
                  className="input"
                  rows={3}
                  value={draft.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Bu çıktı hakkında düşüncelerin"
                />
              </div>
              <div>
                <label className="label">Hatalar / sorunlar</label>
                <textarea
                  className="input"
                  rows={3}
                  value={draft.issues}
                  onChange={(e) => set("issues", e.target.value)}
                  placeholder="Bozuk eller, yanlış kıyafet, vs."
                />
              </div>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-ink-900/40 px-4 py-2.5 text-sm transition hover:border-cream-400/30">
              <input
                type="checkbox"
                checked={draft.favorite}
                onChange={(e) => set("favorite", e.target.checked)}
                className="peer sr-only"
              />
              <Star
                size={16}
                className={draft.favorite ? "fill-cream-400 stroke-cream-400" : "stroke-ink-400"}
              />
              <span className="text-ink-200">{draft.favorite ? "Favoride" : "Favoriye ekle"}</span>
            </label>

            <div>
              <label className="label">Durum</label>
              <div className="flex flex-wrap gap-1.5">
                {([null, ...RESULT_STATUSES] as Array<ResultStatus | null>).map((s) => (
                  <button
                    key={s ?? "__none__"}
                    type="button"
                    onClick={() => set("status", s)}
                    className={cx(
                      "rounded-full border px-3 py-1.5 text-[12px] transition active:scale-[0.97]",
                      draft.status === s
                        ? s === null
                          ? "border-ink-500/60 bg-ink-700/40 text-ink-100"
                          : s === "referans"
                          ? "border-cream-400/45 bg-cream-400/12 text-cream-300"
                          : s === "revize"
                          ? "border-plum-300/45 bg-plum-500/15 text-plum-200"
                          : "border-red-400/35 bg-red-950/35 text-red-300"
                        : "border-white/[0.06] bg-ink-900/40 text-ink-350 hover:text-ink-100 hover:border-white/[0.12]"
                    )}
                  >
                    {s === null ? "— durumsuz —" : RESULT_STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] bg-ink-900/40 px-6 py-4">
          <div>
            {existing && (
              <button onClick={() => setConfirmDel(true)} className="btn text-red-300 hover:!border-red-500/40">
                <Trash2 size={15} /> <span className="hidden sm:inline">Sil</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn">Vazgeç</button>
            <button onClick={save} className="btn-primary">
              <Save size={15} /> Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
    <ConfirmDialog
      open={confirmDel}
      title="Bu sonucu silmek istediğine emin misin?"
      message="Bu işlem geri alınamaz."
      confirmLabel="Evet, sil"
      danger
      onConfirm={remove}
      onCancel={() => setConfirmDel(false)}
    />
    </>
  );
};

const RatingRow = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <span className="text-xs text-ink-300">{label}</span>
    <Stars value={value} onChange={onChange} size={16} />
  </div>
);

type VariationCardProps = {
  v: Variation;
  index: number;
  imageUrl: string;
  count: number;
  onChange: (next: Variation) => void;
  onWinner: () => void;
};

const SortableVariationCard = (props: VariationCardProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.v.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 20 : "auto",
  } as React.CSSProperties;
  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-2">
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        type="button"
        aria-label="Sürükleyerek sırala"
        title="Sürükleyerek sırala"
        className="flex cursor-grab items-center rounded-xl border border-white/[0.05] bg-ink-900/30 px-1.5 text-ink-600 transition hover:text-ink-400 active:cursor-grabbing"
      >
        <GripVertical size={13} />
      </button>
      <div className="flex-1">
        <VariationCard {...props} />
      </div>
    </div>
  );
};

const VariationCard = ({ v, index, imageUrl, count, onChange, onWinner }: VariationCardProps) => {
  const upd = <K extends keyof Variation>(k: K, val: Variation[K]) => onChange({ ...v, [k]: val });
  return (
    <div
      className={cx(
        "rounded-xl border bg-ink-950/40 p-3 transition",
        v.isWinner ? "border-cream-400/40 shadow-[0_0_0_1px_rgba(212,180,131,0.18)]" : "border-white/[0.06]"
      )}
    >
      <div className="mb-2 flex items-start gap-2.5">
        <VariationThumb
          src={imageUrl}
          index={index}
          count={count}
          label={v.label}
          className="h-14 w-14 shrink-0"
        />
        <div className="flex flex-1 items-center justify-between gap-2">
          <span className="display text-base text-ink-100">{v.label}</span>
          <button
            type="button"
            onClick={onWinner}
            className={cx(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] transition",
              v.isWinner
                ? "border-cream-400/55 bg-cream-400/15 text-cream-300"
                : "border-white/[0.08] text-ink-400 hover:text-cream-300"
            )}
            title={v.isWinner ? "Kazananlıktan çıkar" : "Bu varyasyonu kazanan seç"}
          >
            <Crown size={10} className={v.isWinner ? "fill-cream-400" : ""} />
            {v.isWinner ? "kazanan" : "kazanan seç"}
          </button>
        </div>
      </div>
      <div className="space-y-0.5">
        <MiniRating label="Genel" value={v.overall} onChange={(n) => upd("overall", n)} />
        <MiniRating label="Yüz" value={v.faceConsistency} onChange={(n) => upd("faceConsistency", n)} />
        <MiniRating label="Gerç." value={v.realism} onChange={(n) => upd("realism", n)} />
        <MiniRating label="Kıy." value={v.outfitAccuracy} onChange={(n) => upd("outfitAccuracy", n)} />
      </div>
      <textarea
        className="input mt-2 text-[12px]"
        rows={2}
        value={v.notes}
        onChange={(e) => upd("notes", e.target.value)}
        placeholder="Notlar"
      />
      <textarea
        className="input mt-1.5 text-[12px]"
        rows={2}
        value={v.issues}
        onChange={(e) => upd("issues", e.target.value)}
        placeholder="Sorunlar"
      />
    </div>
  );
};

const MiniRating = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center justify-between gap-2">
    <span className="w-12 text-[11px] text-ink-400">{label}</span>
    <Stars value={value} onChange={onChange} size={12} />
  </div>
);
