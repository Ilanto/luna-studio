import { NavLink } from "react-router-dom";
import { GalleryHorizontal, LayoutDashboard, Library, Users, Wand2, Settings } from "lucide-react";
import { cx } from "../utils/cx";

const items = [
  { to: "/", icon: LayoutDashboard, label: "Dash", end: true },
  { to: "/library", icon: Library, label: "Kütüphane" },
  { to: "/builder", icon: Wand2, label: "Builder" },
  { to: "/characters", icon: Users, label: "Karakter" },
  { to: "/results", icon: GalleryHorizontal, label: "Galeri" },
  { to: "/settings", icon: Settings, label: "Ayar" },
];

export const MobileNav = () => (
  <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/[0.06] bg-ink-950/90 px-2 py-2 backdrop-blur-2xl md:hidden">
    {items.map(({ to, icon: Icon, label, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          cx(
            "relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-all",
            isActive ? "text-ink-100" : "text-ink-400 hover:text-ink-200"
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span
                className="absolute -top-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-cream-400 to-wine-400"
                aria-hidden
              />
            )}
            <Icon size={18} strokeWidth={1.6} />
            <span className="max-w-full truncate">{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);
