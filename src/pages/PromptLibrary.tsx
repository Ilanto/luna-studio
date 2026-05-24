import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Library, Plus, Star } from "lucide-react";
import { useStudio } from "../hooks/useStudio";
import { useToast } from "../hooks/useToast";
import { PromptCard } from "../components/PromptCard";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ResultEditor } from "../components/ResultEditor";
import { CATEGORIES, type Category } from "../types";
import { copyText } from "../utils/clipboard";
import { Topbar } from "../components/Topbar";

type SortKey = "updated" | "created" | "rating" | "title";

export const PromptLibrary = () => {
  const { prompts, results, removePrompt, toggleFavorite } = useStudio();
  const { push } = useToast();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [favOnly, setFavOnly] = useState<boolean>(params.get("fav") === "1");
  const [tag, setTag] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [resultEditor, setResultEditor] = useState<{ open: boolean; promptId: string | null }>({
    open: false,
    promptId: null,
  });

  const statsByPrompt = useMemo(() => {
    const acc: Record<string, { total: number; grids: number; winners: number; sumOverall: number }> = {};
    for (const r of results) {
      if (!r.promptId) continue;
      if (!acc[r.promptId]) acc[r.promptId] = { total: 0, grids: 0, winners: 0, sumOverall: 0 };
      acc[r.promptId].total += 1;
      if (r.resultType === "grid") acc[r.promptId].grids += 1;
      if (r.variations.some((v) => v.isWinner)) acc[r.promptId].winners += 1;
      acc[r.promptId].sumOverall += r.overall;
    }
    const out: Record<string, { total: number; grids: number; winners: number; avgOverall: number }> = {};
    for (const [id, s] of Object.entries(acc)) {
      out[id] = { ...s, avgOverall: s.total > 0 ? s.sumOverall / s.total : 0 };
    }
    return out;
  }, [results]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    prompts.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return [...s].sort();
  }, [prompts]);

  const filtered = useMemo(() => {
    let list = [...prompts];
    if (favOnly) list = list.filter((p) => p.favorite);
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (tag) list = list.filter((p) => p.tags.includes(tag));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case "rating": return b.rating - a.rating;
        case "title": return a.title.localeCompare(b.title, "tr");
        case "created": return +new Date(b.createdAt) - +new Date(a.createdAt);
        case "updated":
        default: return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      }
    });
    return list;
  }, [prompts, favOnly, category, tag, search, sort]);

  const handleCopy = async (text: string) => {
    const ok = await copyText(text);
    push(ok ? "Prompt kopyalandı" : "Kopyalanamadı", ok ? "success" : "danger");
  };

  const confirmDelete = () => {
    if (!confirmId) return;
    removePrompt(confirmId);
    setConfirmId(null);
    push("Prompt silindi");
  };

  return (
    <div className="flex flex-1 flex-col">
      <Topbar onSearch={setSearch} search={search} />

      <div className="space-y-6 px-6 pb-28 pt-6 sm:px-10">
        <div className="card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setCategory("all")}
              className={"chip transition " + (category === "all" ? "chip-active" : "hover:!text-ink-100")}
            >
              hepsi · {prompts.length}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={"chip transition " + (category === c ? "chip-active" : "hover:!text-ink-100")}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const v = !favOnly;
                setFavOnly(v);
                const next = new URLSearchParams(params);
                if (v) next.set("fav", "1"); else next.delete("fav");
                setParams(next, { replace: true });
              }}
              className={
                "chip flex items-center gap-1.5 transition " +
                (favOnly ? "!border-cream-400/45 !bg-cream-400/10 !text-cream-400" : "hover:!text-ink-100")
              }
            >
              <Star size={11} strokeWidth={1.6} className={favOnly ? "fill-cream-400" : ""} />
              favoriler
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-white/[0.06] bg-ink-850/60 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-ink-300 outline-none focus:border-wine-400/55"
            >
              <option value="updated">Son güncelleme</option>
              <option value="created">Oluşturma</option>
              <option value="rating">Puan</option>
              <option value="title">Başlık (A→Z)</option>
            </select>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.22em] text-ink-500">etiketler</span>
            <button
              className={"chip transition " + (tag === "" ? "chip-active" : "hover:!text-ink-100")}
              onClick={() => setTag("")}
            >
              tümü
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t === tag ? "" : t)}
                className={"chip transition " + (tag === t ? "chip-active" : "hover:!text-ink-100")}
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Library size={20} />}
            title="Burası şimdilik sessiz"
            description="Yeni bir prompt oluştur ya da filtreleri değiştirip tekrar dene."
            action={
              <Link to="/editor" className="btn-primary">
                <Plus size={15} /> İlk promptu ekle
              </Link>
            }
          />
        ) : (
          <div className="stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                stats={statsByPrompt[p.id]}
                onCopy={() => handleCopy(p.body)}
                onToggleFavorite={() => toggleFavorite(p.id)}
                onDelete={() => setConfirmId(p.id)}
                onAddResult={() => setResultEditor({ open: true, promptId: p.id })}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Bu promptu silmek istediğine emin misin?"
        message="Bu işlem geri alınamaz."
        confirmLabel="Evet, sil"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />

      <ResultEditor
        open={resultEditor.open}
        prefill={{ promptId: resultEditor.promptId }}
        onClose={() => setResultEditor({ open: false, promptId: null })}
      />
    </div>
  );
};
