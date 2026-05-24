import { Link, useLocation } from "react-router-dom";
import { Plus, Search } from "lucide-react";

const TITLES: Record<string, { eyebrow: string; title: string; sub: string }> = {
  "/": { eyebrow: "stüdyo", title: "Selam", sub: "Bugün ne yaratacağız?" },
  "/library": { eyebrow: "arşiv", title: "Prompt Library", sub: "Kayıtlı tüm fikirlerin tek yerde." },
  "/editor": { eyebrow: "atölye", title: "Yeni Prompt", sub: "Bir fikir parla­dıysa, hemen yakala." },
  "/characters": { eyebrow: "yüzler", title: "Karakterler", sub: "Tutarlı yüzler, tutarlı vibe'lar." },
  "/builder": { eyebrow: "kurgu", title: "Prompt Builder", sub: "Parça parça birleştir, oluşan promptu kopyala." },
  "/results": { eyebrow: "galeri", title: "Result Gallery", sub: "Hangi prompt iyi sonuç verdi, hangisi tutmadı — burada görürsün." },
  "/settings": { eyebrow: "atölye notları", title: "Ayarlar", sub: "Veri yedekle, içe aktar, sıfırla." },
};

export const Topbar = ({ onSearch, search }: { onSearch?: (v: string) => void; search?: string }) => {
  const { pathname } = useLocation();
  const meta = TITLES[pathname] ?? TITLES["/"];
  const showSearch = pathname === "/library";

  return (
    <header className="relative flex flex-col gap-4 border-b border-white/[0.05] bg-ink-950/40 px-6 pb-6 pt-7 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between sm:px-10">
      <div className="animate-fade-up">
        <div className="text-[10.5px] uppercase tracking-[0.32em] text-cream-400/85">
          {meta.eyebrow}
        </div>
        <h1 className="display mt-2 text-4xl text-ink-100 sm:text-[44px]">
          {meta.title}
        </h1>
        <p className="mt-1.5 text-sm text-ink-400">{meta.sub}</p>
      </div>
      <div className="flex items-center gap-2">
        {showSearch && onSearch && (
          <label className="group relative hidden md:block">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 transition-colors group-focus-within:text-ink-200"
            />
            <input
              value={search ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Promptlarda ara..."
              className="w-72 rounded-2xl border border-white/[0.06] bg-ink-900/55 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-wine-400/55 focus:ring-2 focus:ring-wine-400/15"
            />
          </label>
        )}
        <Link to="/editor" className="btn-primary">
          <Plus size={16} strokeWidth={2} />
          Yeni Prompt
        </Link>
      </div>
    </header>
  );
};
