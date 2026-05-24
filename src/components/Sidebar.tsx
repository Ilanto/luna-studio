import { NavLink } from "react-router-dom";
import { BarChart3, GalleryHorizontal, LayoutDashboard, Library, PenLine, Settings, Users, Wand2 } from "lucide-react";
import { cx } from "../utils/cx";
import { useStudio } from "../hooks/useStudio";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, countKey: null },
  { to: "/library", label: "Prompt Library", icon: Library, end: false, countKey: "prompts" },
  { to: "/editor", label: "Yeni Prompt", icon: PenLine, end: false, countKey: null },
  { to: "/characters", label: "Karakterler", icon: Users, end: false, countKey: "characters" },
  { to: "/builder", label: "Prompt Builder", icon: Wand2, end: false, countKey: null },
  { to: "/results", label: "Galeri", icon: GalleryHorizontal, end: false, countKey: "results" },
  { to: "/models", label: "Modeller", icon: BarChart3, end: false, countKey: null },
  { to: "/settings", label: "Ayarlar", icon: Settings, end: false, countKey: null },
] as const;

export const Sidebar = () => {
  const { prompts, characters, results } = useStudio();
  const counts = { prompts: prompts.length, characters: characters.length, results: results.length };

  return (
    <aside className="hidden md:flex md:w-[268px] shrink-0 flex-col gap-7 border-r border-white/[0.05] bg-ink-950/55 px-5 py-7 backdrop-blur-xl">
      <div className="flex items-center gap-3 pl-1">
        <LogoMark />
        <div>
          <div className="display text-[20px] leading-none text-ink-100">Luna Studio</div>
          <div className="mt-1.5 text-[10px] uppercase tracking-[0.28em] text-ink-400">
            kişisel prompt stüdyo
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon, end, countKey }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cx("nav-link", isActive && "active")}
          >
            <Icon size={16} strokeWidth={1.5} className="text-ink-350" />
            <span className="flex-1">{label}</span>
            {countKey && counts[countKey] > 0 && (
              <span className="rounded-md border border-white/[0.06] bg-ink-900/70 px-1.5 py-0.5 text-[10px] font-mono text-ink-400">
                {counts[countKey]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-wine-700/35 via-ink-850 to-ink-900 p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-wine-400/30 blur-3xl animate-drift" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.24em] text-cream-400">bu gece</div>
            <div className="display mt-1.5 text-[17px] leading-tight text-ink-100">
              Bir an, bir ışık. Mükemmel olmasın — sahici olsun.
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-400">
              <span className="inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-cream-400 shadow-cream-glow" />
              stüdyo açık
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const LogoMark = () => (
  <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-ink-850 shadow-glow">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_32%,#F0E4CD_0%,#8C3A52_50%,#13080F_100%)]" />
    <div className="absolute inset-0 translate-x-[32%] -translate-y-[14%] rounded-full bg-ink-975" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_32%,rgba(255,255,255,0.4)_0%,transparent_30%)] mix-blend-overlay" />
  </div>
);
