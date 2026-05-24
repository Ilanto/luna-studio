import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Brain, Copy, Save, Wand2 } from "lucide-react";
import { useStudio } from "../hooks/useStudio";
import { useToast } from "../hooks/useToast";
import { copyText } from "../utils/clipboard";
import {
  CAMERAS,
  LIGHTS,
  LOCATIONS,
  NEGATIVE_BITS,
  OUTFITS,
  POSES,
  QUALITY_BITS,
  STYLES,
} from "../data/builderOptions";
import type { CharacterProfile, CharacterMemoryKey } from "../types";

type StringList = string[];

const togglePick = (list: StringList, v: string, multi = false): StringList => {
  if (multi) return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  return list[0] === v ? [] : [v];
};

const MEMORY_BODY_KEYS: CharacterMemoryKey[] = [
  "face",
  "hair",
  "glasses",
  "outfit",
  "camera",
  "fragments",
];

const memoryBodyText = (char?: CharacterProfile): string => {
  if (!char) return "";
  return MEMORY_BODY_KEYS
    .filter((k) => char.include[k])
    .map((k) => char.memory[k].trim())
    .filter(Boolean)
    .join(", ");
};

const memoryAvoidText = (char?: CharacterProfile): string => {
  if (!char) return "";
  return char.include.avoid ? char.memory.avoid.trim() : "";
};

const buildPrompt = (s: BuilderState, char?: CharacterProfile): string => {
  const parts: string[] = [];
  if (char?.mainPrompt) parts.push(char.mainPrompt.trim());
  const mem = memoryBodyText(char);
  if (mem) parts.push(mem);
  if (s.location) parts.push(`set in ${s.location}`);
  if (s.outfit) parts.push(`wearing ${s.outfit}`);
  if (s.pose) parts.push(`pose: ${s.pose}`);
  if (s.light) parts.push(`light: ${s.light}`);
  if (s.camera) parts.push(`camera: ${s.camera}`);
  if (s.style) parts.push(`style: ${s.style}`);
  if (s.quality.length) parts.push(s.quality.join(", "));
  return parts.filter(Boolean).join(", ");
};

interface BuilderState {
  characterId: string;
  location: string;
  outfit: string;
  camera: string;
  light: string;
  pose: string;
  style: string;
  quality: string[];
  negative: string[];
}

const empty: BuilderState = {
  characterId: "",
  location: "",
  outfit: "",
  camera: "",
  light: "",
  pose: "",
  style: "",
  quality: [],
  negative: [],
};

export const PromptBuilder = () => {
  const { characters, addPrompt } = useStudio();
  const { push } = useToast();
  const loc = useLocation();
  const nav = useNavigate();
  const seedCharId = (loc.state as { characterId?: string } | null)?.characterId;

  const [s, setS] = useState<BuilderState>({
    ...empty,
    characterId: seedCharId ?? characters[0]?.id ?? "",
  });
  const [output, setOutput] = useState("");
  const [edited, setEdited] = useState(false);

  const selectedChar = useMemo(
    () => characters.find((c) => c.id === s.characterId),
    [characters, s.characterId]
  );

  useEffect(() => {
    if (!edited) setOutput(buildPrompt(s, selectedChar));
  }, [s, selectedChar, edited]);

  const builderNegative = s.negative.join(", ");
  const characterAvoid = memoryAvoidText(selectedChar);
  const negativeText = [characterAvoid, builderNegative].filter(Boolean).join(", ");
  const pickedCount =
    [s.location, s.outfit, s.camera, s.light, s.pose, s.style].filter(Boolean).length +
    s.quality.length;

  const memoryActiveCount = selectedChar
    ? (Object.keys(selectedChar.include) as CharacterMemoryKey[]).filter(
        (k) => selectedChar.include[k] && selectedChar.memory[k].trim() !== ""
      ).length
    : 0;

  const generate = () => {
    setEdited(false);
    setOutput(buildPrompt(s, selectedChar));
    push("Prompt oluşturuldu", "success");
  };

  const onCopy = async () => {
    const ok = await copyText(output);
    push(ok ? "Prompt kopyalandı" : "Kopyalanamadı", ok ? "success" : "danger");
  };

  const saveToLibrary = () => {
    if (!output.trim()) {
      push("Önce bir şeyler seç", "danger");
      return;
    }
    const created = addPrompt({
      title: selectedChar ? `${selectedChar.name} — ${s.style || s.location || "yeni deneme"}` : "Builder promptu",
      category: "Luna",
      description: [s.location, s.style].filter(Boolean).join(" · "),
      body: output,
      negative: negativeText,
      notes: "Prompt Builder'dan oluşturuldu.",
      tags: [s.style, s.location, s.camera].filter(Boolean).map((x) => x.toLowerCase().split(" ")[0]),
      rating: 0,
      outcome: "",
      favorite: false,
    });
    push("Kütüphaneye eklendi", "success");
    nav(`/editor/${created.id}`);
  };

  return (
    <div className="grid flex-1 gap-6 px-6 pb-28 pt-7 sm:px-10 xl:grid-cols-[1fr_440px]">
      <div className="space-y-5 animate-fade-up">
        <Section num="01" title="Karakter" subtitle="hangi karakter ile çalışıyoruz?">
          <div className="flex flex-wrap gap-2">
            {characters.map((c) => {
              const memCount = (Object.keys(c.include) as CharacterMemoryKey[]).filter(
                (k) => c.include[k] && c.memory[k].trim() !== ""
              ).length;
              const isActive = c.id === s.characterId;
              return (
                <Pill
                  key={c.id}
                  active={isActive}
                  onClick={() => setS({ ...s, characterId: c.id })}
                >
                  {c.name}
                  {memCount > 0 && (
                    <span
                      className={
                        "ml-1.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] " +
                        (isActive
                          ? "bg-cream-400/15 text-cream-400"
                          : "bg-white/[0.04] text-ink-400")
                      }
                    >
                      <Brain size={9} /> {memCount}
                    </span>
                  )}
                </Pill>
              );
            })}
            <Pill active={!s.characterId} onClick={() => setS({ ...s, characterId: "" })}>
              karaktersiz
            </Pill>
          </div>
        </Section>

        <BuilderRow num="02" title="Mekan" options={LOCATIONS} value={s.location} onPick={(v) => setS({ ...s, location: v })} />
        <BuilderRow num="03" title="Kıyafet" options={OUTFITS} value={s.outfit} onPick={(v) => setS({ ...s, outfit: v })} />
        <BuilderRow num="04" title="Kamera" options={CAMERAS} value={s.camera} onPick={(v) => setS({ ...s, camera: v })} />
        <BuilderRow num="05" title="Işık" options={LIGHTS} value={s.light} onPick={(v) => setS({ ...s, light: v })} />
        <BuilderRow num="06" title="Poz" options={POSES} value={s.pose} onPick={(v) => setS({ ...s, pose: v })} />
        <BuilderRow num="07" title="Stil" options={STYLES} value={s.style} onPick={(v) => setS({ ...s, style: v })} />

        <Section num="08" title="Kalite ayarı" subtitle="bunlardan istediğin kadarını seç">
          <div className="flex flex-wrap gap-2">
            {QUALITY_BITS.map((q) => (
              <Pill
                key={q}
                active={s.quality.includes(q)}
                onClick={() => setS({ ...s, quality: togglePick(s.quality, q, true) })}
              >
                {q}
              </Pill>
            ))}
          </div>
        </Section>

        <Section num="09" title="Negatif prompt" subtitle="kaçınmak istediklerin">
          <div className="flex flex-wrap gap-2">
            {NEGATIVE_BITS.map((q) => (
              <Pill
                key={q}
                tone="danger"
                active={s.negative.includes(q)}
                onClick={() => setS({ ...s, negative: togglePick(s.negative, q, true) })}
              >
                {q}
              </Pill>
            ))}
          </div>
        </Section>
      </div>

      <aside className="space-y-4 animate-fade-up xl:sticky xl:top-24 xl:h-fit" style={{ animationDelay: "0.08s" }}>
        <div className="card-raised relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-wine-500/30 blur-3xl animate-drift" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-plum-400/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-2">
              <div className="chip-cream">
                <Wand2 size={11} /> üretilen prompt
              </div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-ink-500">
                <span>{pickedCount} seçim</span>
                {memoryActiveCount > 0 && (
                  <>
                    <span className="opacity-50">·</span>
                    <span className="inline-flex items-center gap-1 text-cream-400/85">
                      <Brain size={10} /> {memoryActiveCount} hafıza
                    </span>
                  </>
                )}
              </div>
            </div>
            <button onClick={generate} className="btn-primary mt-4 w-full justify-center">
              Promptu oluştur
            </button>

            <label className="label mt-5">Ana prompt (düzenleyebilirsin)</label>
            <textarea
              className="input font-mono text-[12.5px] leading-relaxed"
              rows={9}
              value={output}
              onChange={(e) => { setEdited(true); setOutput(e.target.value); }}
              placeholder="Yukarıdan parçalar seç, prompt burada belirir..."
            />

            {negativeText && (
              <>
                <label className="label mt-4">Negatif prompt</label>
                <textarea
                  className="input font-mono text-[12.5px] leading-relaxed"
                  rows={3}
                  value={negativeText}
                  readOnly
                />
              </>
            )}

            <div className="mt-4 flex gap-2">
              <button onClick={onCopy} className="btn flex-1 justify-center">
                <Copy size={15} /> Kopyala
              </button>
              <button onClick={saveToLibrary} className="btn-primary flex-1 justify-center">
                <Save size={15} /> Kaydet
              </button>
            </div>
          </div>
        </div>

        {selectedChar && (
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-cream-400/30 bg-cream-400/10 text-[11px] font-mono text-cream-400">
                  {selectedChar.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="display text-base text-ink-100">{selectedChar.name}</div>
              </div>
              <span className="chip-cream">
                <Brain size={11} /> {memoryActiveCount} hafıza
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-ink-400 line-clamp-3">
              {selectedChar.overview}
            </p>
            <div className="mt-3 border-t border-white/[0.05] pt-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-ink-500">prompta giden</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(Object.keys(selectedChar.include) as CharacterMemoryKey[]).map((k) => {
                  const on = selectedChar.include[k] && selectedChar.memory[k].trim() !== "";
                  const label = MEMORY_BADGE_LABELS[k];
                  return (
                    <span
                      key={k}
                      className={
                        "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] transition " +
                        (on
                          ? k === "avoid"
                            ? "border-red-500/35 bg-red-500/10 text-red-200"
                            : "border-cream-400/30 bg-cream-400/10 text-cream-400"
                          : "border-white/[0.05] bg-ink-900/50 text-ink-500 line-through")
                      }
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-ink-500">
                Açık/kapatmak için Karakterler sayfasına geç.
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

const MEMORY_BADGE_LABELS: Record<CharacterMemoryKey, string> = {
  face: "yüz",
  hair: "saç",
  glasses: "gözlük",
  outfit: "kıyafet",
  camera: "kamera",
  avoid: "avoid",
  fragments: "parça",
};

const Section = ({ num, title, subtitle, children }: { num: string; title: string; subtitle?: string; children: ReactNode }) => (
  <div className="card p-5 sm:p-6">
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="step-num">{num}</span>
        <div className="display text-lg text-ink-100">{title}</div>
      </div>
      {subtitle && <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500">{subtitle}</div>}
    </div>
    {children}
  </div>
);

const BuilderRow = ({ num, title, options, value, onPick }: { num: string; title: string; options: string[]; value: string; onPick: (v: string) => void }) => (
  <Section num={num} title={title}>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Pill key={o} active={o === value} onClick={() => onPick(o === value ? "" : o)}>
          {o}
        </Pill>
      ))}
    </div>
  </Section>
);

const Pill = ({ active, onClick, children, tone = "default" }: { active: boolean; onClick: () => void; children: ReactNode; tone?: "default" | "danger" }) => {
  const base = "rounded-full border px-3.5 py-1.5 text-[12px] transition-all duration-200 active:scale-[0.97]";
  const activeStyle =
    tone === "danger"
      ? "border-red-500/55 bg-red-900/35 text-red-100 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
      : "border-wine-400/55 bg-wine-500/20 text-ink-100 shadow-[0_0_0_3px_rgba(140,58,82,0.12)]";
  const idleStyle = "border-white/[0.06] bg-ink-900/40 text-ink-350 hover:border-white/[0.12] hover:text-ink-100 hover:-translate-y-px";
  return (
    <button onClick={onClick} className={`${base} ${active ? activeStyle : idleStyle}`}>
      {children}
    </button>
  );
};
