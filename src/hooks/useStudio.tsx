import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CharacterProfile, DataShape, Prompt, ResultEntry } from "../types";
import { loadData, saveData } from "../utils/storage";
import { newId, nowIso } from "../utils/id";
import { useToast } from "./useToast";

interface StudioContextValue {
  data: DataShape;
  prompts: Prompt[];
  characters: CharacterProfile[];
  results: ResultEntry[];
  addPrompt: (p: Omit<Prompt, "id" | "createdAt" | "updatedAt">) => Prompt;
  updatePrompt: (id: string, patch: Partial<Prompt>) => void;
  removePrompt: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addCharacter: (c: Omit<CharacterProfile, "id" | "createdAt" | "updatedAt">) => CharacterProfile;
  updateCharacter: (id: string, patch: Partial<CharacterProfile>) => void;
  removeCharacter: (id: string) => void;
  addResult: (r: Omit<ResultEntry, "id" | "createdAt" | "updatedAt">) => ResultEntry;
  updateResult: (id: string, patch: Partial<ResultEntry>) => void;
  removeResult: (id: string) => void;
  toggleResultFavorite: (id: string) => void;
  replaceAll: (next: DataShape) => void;
}

const StudioContext = createContext<StudioContextValue | undefined>(undefined);

export const StudioProvider = ({ children }: { children: ReactNode }) => {
  const { push } = useToast();
  const [data, setData] = useState<DataShape>(() => loadData());
  const lastError = useRef<string | null>(null);

  useEffect(() => {
    const result = saveData(data);
    if (!result.ok) {
      if (lastError.current !== result.reason) {
        lastError.current = result.reason;
        push(result.reason, "danger");
      }
    } else {
      lastError.current = null;
    }
  }, [data, push]);

  const addPrompt: StudioContextValue["addPrompt"] = useCallback((p) => {
    const created: Prompt = { ...p, id: newId(), createdAt: nowIso(), updatedAt: nowIso() };
    setData((d) => ({ ...d, prompts: [created, ...d.prompts] }));
    return created;
  }, []);

  const updatePrompt: StudioContextValue["updatePrompt"] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      prompts: d.prompts.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p)),
    }));
  }, []);

  const removePrompt: StudioContextValue["removePrompt"] = useCallback((id) => {
    setData((d) => ({ ...d, prompts: d.prompts.filter((p) => p.id !== id) }));
  }, []);

  const toggleFavorite: StudioContextValue["toggleFavorite"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      prompts: d.prompts.map((p) => (p.id === id ? { ...p, favorite: !p.favorite, updatedAt: nowIso() } : p)),
    }));
  }, []);

  const addCharacter: StudioContextValue["addCharacter"] = useCallback((c) => {
    const created: CharacterProfile = { ...c, id: newId(), createdAt: nowIso(), updatedAt: nowIso() };
    setData((d) => ({ ...d, characters: [created, ...d.characters] }));
    return created;
  }, []);

  const updateCharacter: StudioContextValue["updateCharacter"] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      characters: d.characters.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowIso() } : c)),
    }));
  }, []);

  const removeCharacter: StudioContextValue["removeCharacter"] = useCallback((id) => {
    setData((d) => ({ ...d, characters: d.characters.filter((c) => c.id !== id) }));
  }, []);

  const addResult: StudioContextValue["addResult"] = useCallback((r) => {
    const created: ResultEntry = { ...r, id: newId(), createdAt: nowIso(), updatedAt: nowIso() };
    setData((d) => ({ ...d, results: [created, ...d.results] }));
    return created;
  }, []);

  const updateResult: StudioContextValue["updateResult"] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      results: d.results.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r)),
    }));
  }, []);

  const removeResult: StudioContextValue["removeResult"] = useCallback((id) => {
    setData((d) => ({ ...d, results: d.results.filter((r) => r.id !== id) }));
  }, []);

  const toggleResultFavorite: StudioContextValue["toggleResultFavorite"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      results: d.results.map((r) =>
        r.id === id ? { ...r, favorite: !r.favorite, updatedAt: nowIso() } : r
      ),
    }));
  }, []);

  const replaceAll: StudioContextValue["replaceAll"] = useCallback((next) => {
    setData(next);
  }, []);

  const value = useMemo<StudioContextValue>(
    () => ({
      data,
      prompts: data.prompts,
      characters: data.characters,
      results: data.results,
      addPrompt,
      updatePrompt,
      removePrompt,
      toggleFavorite,
      addCharacter,
      updateCharacter,
      removeCharacter,
      addResult,
      updateResult,
      removeResult,
      toggleResultFavorite,
      replaceAll,
    }),
    [
      data,
      addPrompt,
      updatePrompt,
      removePrompt,
      toggleFavorite,
      addCharacter,
      updateCharacter,
      removeCharacter,
      addResult,
      updateResult,
      removeResult,
      toggleResultFavorite,
      replaceAll,
    ]
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
};

export const useStudio = (): StudioContextValue => {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
};
