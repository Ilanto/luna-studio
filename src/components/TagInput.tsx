import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export const TagInput = ({ value, onChange, placeholder = "Etiket ekle, Enter'a bas" }: Props) => {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim().replace(/^#/, "");
    if (!v) return;
    if (value.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...value, v]);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-ink-700/80 bg-ink-900/60 p-2 focus-within:border-wine-400/60 focus-within:ring-2 focus-within:ring-wine-400/20">
      {value.map((t) => (
        <span key={t} className="chip-wine">
          #{t}
          <button onClick={() => onChange(value.filter((x) => x !== t))} className="ml-1 opacity-70 hover:opacity-100">
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent px-1.5 py-1 text-sm text-ink-100 placeholder:text-ink-500 outline-none"
      />
    </div>
  );
};
