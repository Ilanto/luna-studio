import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Copy, ImagePlus, Save, Sparkles, Star, Trash2 } from "lucide-react";
import { useStudio } from "../hooks/useStudio";
import { useToast } from "../hooks/useToast";
import { Stars } from "../components/Stars";
import { TagInput } from "../components/TagInput";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ResultEditor } from "../components/ResultEditor";
import { ResultThumb } from "../components/ResultThumb";
import { RatingBar } from "../components/RatingBar";
import { CATEGORIES, type Category, type Prompt } from "../types";
import { copyText } from "../utils/clipboard";
import { QUICK_ACTIONS, NEGATIVE_BITS } from "../data/builderOptions";

const blank = (preset?: Partial<Prompt>): Omit<Prompt, "id" | "createdAt" | "updatedAt"> => ({
  title: preset?.title ?? "",
  category: (preset?.category as Category) ?? "Luna",
  description: preset?.description ?? "",
  body: preset?.body ?? "",
  negative: preset?.negative ?? "",
  notes: preset?.notes ?? "",
  tags: preset?.tags ?? [],
  rating: preset?.rating ?? 0,
  outcome: preset?.outcome ?? "",
  favorite: preset?.favorite ?? false,
});

export const PromptEditor = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const { prompts, results, addPrompt, updatePrompt, removePrompt } = useStudio();
  const { push } = useToast();
  const existing = useMemo(() => prompts.find((p) => p.id === id), [prompts, id]);
  const presetFromBuilder = (loc.state as { preset?: Partial<Prompt> } | null)?.preset;

  const [form, setForm] = useState(() => blank(existing ?? presetFromBuilder));
  const [confirm, setConfirm] = useState(false);
  const [resultEditor, setResultEditor] = useState<{ open: boolean; resultId: string | null }>({
    open: false,
    resultId: null,
  });

  const linkedResults = useMemo(
    () => (existing ? results.filter((r) => r.promptId === existing.id) : []),
    [results, existing]
  );

  useEffect(() => {
    if (existing) setForm(blank(existing));
  }, [existing]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.title.trim()) {
      push("Önce bir başlık yazalım", "danger");
      return;
    }
    if (existing) {
      updatePrompt(existing.id, form);
      push("Prompt güncellendi", "success");
    } else {
      const created = addPrompt(form);
      push("Prompt kaydedildi", "success");
      nav(`/editor/${created.id}`, { replace: true });
    }
  };

  const handleCopy = async () => {
    const ok = await copyText(form.body);
    push(ok ? "Prompt kopyalandı" : "Kopyalanamadı", ok ? "success" : "danger");
  };

  const remove = () => {
    if (existing) removePrompt(existing.id);
    push("Prompt silindi");
    nav("/library");
  };

  const applyQuick = (idx: number) => {
    const action = QUICK_ACTIONS[idx];
    if (action.label === "Negatif prompt ekle") {
      const extras = NEGATIVE_BITS.filter((n) => !form.negative.includes(n)).slice(0, 4).join(", ");
      set("negative", form.negative ? `${form.negative}, ${extras}` : extras);
      push("Negatif prompt zenginleştirildi", "success");
      return;
    }
    const next = form.body ? `${form.body.trim()}, ${action.append}` : action.append;
    set("body", next);
    push(`"${action.label}" eklendi`, "success");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] bg-ink-950/70 px-6 py-5 backdrop-blur-2xl sm:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/library" className="btn-ghost shrink-0" aria-label="Geri">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Geri</span>
          </Link>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.28em] text-cream-400/80">
              {existing ? "düzenleniyor" : "yeni kayıt"}
            </div>
            <div className="display mt-0.5 truncate text-2xl text-ink-100 sm:text-[28px]">
              {existing ? existing.title || "İsimsiz prompt" : "Yeni prompt"}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleCopy} className="btn">
            <Copy size={15} />
            <span className="hidden sm:inline">Kopyala</span>
          </button>
          {existing && (
            <button onClick={() => setConfirm(true)} className="btn text-red-300 hover:!border-red-500/40">
              <Trash2 size={15} />
              <span className="hidden sm:inline">Sil</span>
            </button>
          )}
          <button onClick={save} className="btn-primary">
            <Save size={15} /> Kaydet
          </button>
        </div>
      </div>

      <div className="grid flex-1 gap-6 px-6 pb-28 pt-7 sm:px-10 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5 animate-fade-up">
          <div className="card p-6 sm:p-7">
            <SectionHeader num="01" title="Başlık ve kategori" />
            <div className="mt-4 grid gap-5 md:grid-cols-[1fr_240px]">
              <div>
                <label className="label">Başlık</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Örn: Luna — yağmurlu kafe penceresi"
                />
              </div>
              <div>
                <label className="label">Kategori</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value as Category)}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="label">Kısa açıklama</label>
              <input
                className="input"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Tek satırlık özet — sonra hatırlamak için"
              />
            </div>

            <div className="mt-5">
              <label className="label">Etiketler</label>
              <TagInput value={form.tags} onChange={(v) => set("tags", v)} />
            </div>
          </div>

          <div className="card p-6 sm:p-7">
            <SectionHeader num="02" title="Ana prompt" hint={`${form.body.length} karakter`} />
            <textarea
              className="input mt-4 font-mono text-[13.5px] leading-[1.75]"
              rows={12}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              placeholder="Detayları buraya yaz. Daha çok ve daha açıklayıcı, daha tutarlı çıktı verir."
            />

            <div className="mt-6">
              <SectionHeader num="03" title="Negatif prompt" subtle />
              <textarea
                className="input mt-3 font-mono text-[13px] leading-relaxed"
                rows={4}
                value={form.negative}
                onChange={(e) => set("negative", e.target.value)}
                placeholder="Ne istemediğini yaz — plastik cilt, bozuk eller, vs."
              />
            </div>
          </div>

          <div className="card p-6 sm:p-7">
            <SectionHeader num="04" title="Notlar ve sonuç" />
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <label className="label">Notlar</label>
                <textarea
                  className="input"
                  rows={4}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Kendine not — denerken hatırlamak istediklerin"
                />
              </div>
              <div>
                <label className="label">Sonuç yorumu</label>
                <textarea
                  className="input"
                  rows={4}
                  value={form.outcome}
                  onChange={(e) => set("outcome", e.target.value)}
                  placeholder="Çıktıyı denedikten sonra: yüz iyi çıktı, ışık bozuldu, vs."
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.05] pt-5">
              <div>
                <div className="label">Kalite notu</div>
                <Stars value={form.rating} onChange={(v) => set("rating", v)} size={20} />
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-ink-900/40 px-4 py-2.5 text-sm transition hover:border-cream-400/30">
                <input
                  type="checkbox"
                  checked={form.favorite}
                  onChange={(e) => set("favorite", e.target.checked)}
                  className="peer sr-only"
                />
                <Star
                  size={16}
                  className={form.favorite ? "fill-cream-400 stroke-cream-400" : "stroke-ink-400"}
                />
                <span className="text-ink-200">{form.favorite ? "Favoride" : "Favoriye ekle"}</span>
              </label>
            </div>
          </div>
        </div>

        <aside className="space-y-4 animate-fade-up xl:sticky xl:top-24 xl:h-fit" style={{ animationDelay: "0.08s" }}>
          <div className="card-raised relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-wine-500/25 blur-3xl" />
            <div className="relative">
              <div className="chip-cream mb-3">
                <Sparkles size={11} className="text-cream-400" />
                hızlı aksiyon
              </div>
              <div className="display text-lg leading-tight text-ink-100">
                Bir tıkla zenginleştir
              </div>
              <p className="mt-1 text-xs text-ink-400">Ana prompta hazır ifadeler ekler.</p>
              <div className="mt-4 flex flex-col gap-1.5">
                {QUICK_ACTIONS.map((q, i) => (
                  <button
                    key={q.label}
                    onClick={() => applyQuick(i)}
                    className="group flex items-center justify-between gap-2 rounded-xl border border-white/[0.05] bg-ink-900/45 px-3 py-2.5 text-left text-sm text-ink-200 transition-all hover:-translate-y-px hover:border-wine-400/35 hover:bg-ink-850"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <span className="grid h-6 w-6 place-items-center rounded-md border border-cream-400/20 bg-cream-400/5 text-cream-400">
                        <Sparkles size={11} />
                      </span>
                      {q.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5 text-xs leading-relaxed text-ink-400">
            <div className="display mb-1.5 text-base text-ink-100">İpucu</div>
            Promptlar uzadıkça çıktı daha tutarlı olur. Mekan + ışık + kamera + poz + kalite ifadelerini eksik bırakma.
          </div>
        </aside>
      </div>

      {existing && (
        <div className="px-6 pb-12 sm:px-10 xl:pr-[400px]">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.32em] text-cream-400/80">galeri</div>
              <h3 className="display mt-1.5 text-xl text-ink-100">Bu prompta bağlı sonuçlar</h3>
              <p className="mt-1 text-xs text-ink-500">
                {linkedResults.length === 0
                  ? "Henüz bağlı sonuç yok — bir deneme ekle, geri dönüp performansı buradan takip et."
                  : `${linkedResults.length} sonuç kayıtlı.`}
              </p>
            </div>
            <button onClick={() => setResultEditor({ open: true, resultId: null })} className="btn-primary">
              <ImagePlus size={15} /> Sonuç ekle
            </button>
          </div>
          {linkedResults.length === 0 ? (
            <div className="card rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-ink-400">
              Hiç sonuç yok. İlkini ekle.
            </div>
          ) : (
            <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {linkedResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setResultEditor({ open: true, resultId: r.id })}
                  className="card card-hover group overflow-hidden text-left"
                >
                  <ResultThumb src={r.imageUrl} alt={r.title} aspect="portrait" />
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="chip-wine">{r.model}</span>
                      {r.favorite && <span className="chip-cream">★</span>}
                    </div>
                    <div className="display line-clamp-1 text-base text-ink-100">{r.title}</div>
                    <RatingBar label="Genel" value={r.overall} tone="wine" />
                    <RatingBar label="Yüz" value={r.faceConsistency} tone="cream" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <ResultEditor
        open={resultEditor.open}
        resultId={resultEditor.resultId}
        prefill={{ promptId: existing?.id ?? null }}
        onClose={() => setResultEditor({ open: false, resultId: null })}
      />

      <ConfirmDialog
        open={confirm}
        title="Bu promptu silmek istediğine emin misin?"
        message="Bu işlem geri alınamaz."
        confirmLabel="Evet, sil"
        danger
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
};

const SectionHeader = ({ num, title, hint, subtle }: { num: string; title: string; hint?: string; subtle?: boolean }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <span className={"step-num " + (subtle ? "opacity-60" : "")}>{num}</span>
      <div className={"display text-lg " + (subtle ? "text-ink-300" : "text-ink-100")}>{title}</div>
    </div>
    {hint && <span className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500">{hint}</span>}
  </div>
);
