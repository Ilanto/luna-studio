import type {
  CharacterProfile,
  CharacterMemory,
  CharacterInclude,
  DataShape,
  Prompt,
  Category,
  ResultEntry,
  ResultType,
  Variation,
  AIModel,
  FitMode,
} from "../types";
import {
  CATEGORIES,
  CHARACTER_MEMORY_KEYS,
  AI_MODELS,
  FIT_MODES,
  RESULT_TYPES,
  defaultMemory,
  defaultInclude,
} from "../types";
import { SEED_PROMPTS, SEED_CHARACTERS, SEED_RESULTS } from "../data/seed";
import { newId, nowIso } from "./id";

const KEY = "luna-studio:data:v1";
const VERSION = 1;

const isString = (x: unknown): x is string => typeof x === "string";
const isStringArray = (x: unknown): x is string[] => Array.isArray(x) && x.every(isString);

const asCategory = (x: unknown): Category =>
  CATEGORIES.includes(x as Category) ? (x as Category) : "Deneme / Test";

const asAIModel = (x: unknown): AIModel =>
  AI_MODELS.includes(x as AIModel) ? (x as AIModel) : "Diğer";

const asFitMode = (x: unknown): FitMode =>
  FIT_MODES.includes(x as FitMode) ? (x as FitMode) : "cover";

const asResultType = (x: unknown): ResultType =>
  RESULT_TYPES.includes(x as ResultType) ? (x as ResultType) : "single";

const normalizeVariation = (raw: unknown, idx: number): Variation => {
  const v = (raw && typeof raw === "object" ? raw : {}) as Partial<Variation>;
  return {
    id: isString(v.id) && v.id ? v.id : `v_${idx + 1}_${newId()}`,
    label: isString(v.label) && v.label ? v.label : `V${idx + 1}`,
    overall: asRating(v.overall),
    faceConsistency: asRating(v.faceConsistency),
    realism: asRating(v.realism),
    outfitAccuracy: asRating(v.outfitAccuracy),
    notes: isString(v.notes) ? v.notes : "",
    issues: isString(v.issues) ? v.issues : "",
    isWinner: typeof v.isWinner === "boolean" ? v.isWinner : false,
  };
};

const normalizeVariations = (raw: unknown): Variation[] => {
  if (!Array.isArray(raw)) return [];
  const list = raw.map((v, i) => normalizeVariation(v, i));
  // Tek bir kazanan kuralı — birden fazla varsa ilkini koru
  let winnerSeen = false;
  return list.map((v) => {
    if (v.isWinner && !winnerSeen) {
      winnerSeen = true;
      return v;
    }
    return v.isWinner ? { ...v, isWinner: false } : v;
  });
};

const asRating = (x: unknown): number => {
  if (typeof x !== "number" || Number.isNaN(x)) return 0;
  const r = Math.round(x);
  if (r < 0) return 0;
  if (r > 5) return 5;
  return r;
};

const normalizePrompt = (raw: unknown): Prompt | null => {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<Prompt>;
  if (!isString(p.title) && !isString(p.body)) return null;
  return {
    id: isString(p.id) && p.id ? p.id : newId(),
    title: isString(p.title) ? p.title : "Başlıksız prompt",
    category: asCategory(p.category),
    description: isString(p.description) ? p.description : "",
    body: isString(p.body) ? p.body : "",
    negative: isString(p.negative) ? p.negative : "",
    notes: isString(p.notes) ? p.notes : "",
    tags: isStringArray(p.tags) ? p.tags : [],
    rating: typeof p.rating === "number" && p.rating >= 0 && p.rating <= 5 ? Math.round(p.rating) : 0,
    outcome: isString(p.outcome) ? p.outcome : "",
    favorite: typeof p.favorite === "boolean" ? p.favorite : false,
    createdAt: isString(p.createdAt) ? p.createdAt : nowIso(),
    updatedAt: isString(p.updatedAt) ? p.updatedAt : nowIso(),
  };
};

const normalizeMemory = (raw: unknown): CharacterMemory => {
  const out = defaultMemory();
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Record<string, unknown>;
  for (const k of CHARACTER_MEMORY_KEYS) {
    const v = r[k];
    if (isString(v)) out[k] = v;
  }
  return out;
};

const normalizeInclude = (raw: unknown): CharacterInclude => {
  const out = defaultInclude();
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Record<string, unknown>;
  for (const k of CHARACTER_MEMORY_KEYS) {
    if (typeof r[k] === "boolean") out[k] = r[k] as boolean;
  }
  return out;
};

const normalizeCharacter = (raw: unknown): CharacterProfile | null => {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Partial<CharacterProfile>;
  if (!isString(c.name)) return null;

  const faceHair = isString(c.faceHair) ? c.faceHair : "";
  const signatureOutfit = isString(c.signatureOutfit) ? c.signatureOutfit : "";
  const cameraStyle = isString(c.cameraStyle) ? c.cameraStyle : "";
  const avoidFeatures = isString(c.avoidFeatures) ? c.avoidFeatures : "";

  // Memory: önce normalize et, sonra boş kalan alanları eski/legacy alanlardan göç ettir
  const memory = normalizeMemory(c.memory);
  if (!memory.face && faceHair) memory.face = faceHair;
  if (!memory.outfit && signatureOutfit) memory.outfit = signatureOutfit;
  if (!memory.camera && cameraStyle) memory.camera = cameraStyle;
  if (!memory.avoid && avoidFeatures) memory.avoid = avoidFeatures;

  return {
    id: isString(c.id) && c.id ? c.id : newId(),
    name: c.name,
    overview: isString(c.overview) ? c.overview : "",
    faceHair,
    body: isString(c.body) ? c.body : "",
    signatureOutfit,
    locations: isString(c.locations) ? c.locations : "",
    cameraStyle,
    keepFeatures: isString(c.keepFeatures) ? c.keepFeatures : "",
    avoidFeatures,
    memory,
    include: normalizeInclude(c.include),
    mainPrompt: isString(c.mainPrompt) ? c.mainPrompt : "",
    createdAt: isString(c.createdAt) ? c.createdAt : nowIso(),
    updatedAt: isString(c.updatedAt) ? c.updatedAt : nowIso(),
  };
};

const normalizeResult = (raw: unknown): ResultEntry | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<ResultEntry>;
  if (!isString(r.title) && !isString(r.imageUrl) && !isString(r.notes)) return null;
  return {
    id: isString(r.id) && r.id ? r.id : newId(),
    title: isString(r.title) ? r.title : "İsimsiz sonuç",
    promptId: isString(r.promptId) ? r.promptId : null,
    characterId: isString(r.characterId) ? r.characterId : null,
    imageUrl: isString(r.imageUrl) ? r.imageUrl : "",
    model: asAIModel(r.model),
    fitMode: asFitMode(r.fitMode),
    resultType: asResultType(r.resultType),
    variations: normalizeVariations(r.variations),
    variationNotes: isString(r.variationNotes) ? r.variationNotes : "",
    overall: asRating(r.overall),
    faceConsistency: asRating(r.faceConsistency),
    realism: asRating(r.realism),
    outfitAccuracy: asRating(r.outfitAccuracy),
    notes: isString(r.notes) ? r.notes : "",
    issues: isString(r.issues) ? r.issues : "",
    favorite: typeof r.favorite === "boolean" ? r.favorite : false,
    createdAt: isString(r.createdAt) ? r.createdAt : nowIso(),
    updatedAt: isString(r.updatedAt) ? r.updatedAt : nowIso(),
  };
};

const normalizeData = (raw: unknown): DataShape => {
  const fallback: DataShape = { prompts: [], characters: [], results: [], version: VERSION };
  if (!raw || typeof raw !== "object") return fallback;
  const d = raw as Partial<DataShape>;
  const prompts = Array.isArray(d.prompts)
    ? d.prompts.map(normalizePrompt).filter((p): p is Prompt => p !== null)
    : [];
  const characters = Array.isArray(d.characters)
    ? d.characters.map(normalizeCharacter).filter((c): c is CharacterProfile => c !== null)
    : [];
  const results = Array.isArray(d.results)
    ? d.results.map(normalizeResult).filter((r): r is ResultEntry => r !== null)
    : [];
  return {
    prompts,
    characters,
    results,
    version: typeof d.version === "number" ? d.version : VERSION,
  };
};

const seededData = (): DataShape => ({
  prompts: SEED_PROMPTS.map((p) => normalizePrompt(p)!).filter(Boolean),
  characters: SEED_CHARACTERS.map((c) => normalizeCharacter(c)!).filter(Boolean),
  results: SEED_RESULTS.map((r) => normalizeResult(r)!).filter(Boolean),
  version: VERSION,
});

export const loadData = (): DataShape => {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return seededData();
  }
  if (!raw) {
    const fresh = seededData();
    saveData(fresh);
    return fresh;
  }
  try {
    return normalizeData(JSON.parse(raw));
  } catch {
    return seededData();
  }
};

export const saveData = (data: DataShape): { ok: true } | { ok: false; reason: string } => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return { ok: true };
  } catch (e) {
    const reason =
      e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22)
        ? "Tarayıcı depolama alanı doldu"
        : "Veriler kaydedilemedi (tarayıcı depolaması kapalı olabilir)";
    return { ok: false, reason };
  }
};

export const exportJson = (data: DataShape): string => JSON.stringify(data, null, 2);

export const downloadJson = (data: DataShape): void => {
  const text = exportJson(data);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `luna-studio-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export interface ImportResult {
  data: DataShape;
  imported: { prompts: number; characters: number; results: number };
  skipped: { prompts: number; characters: number; results: number };
}

export const importJson = (text: string): ImportResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Dosya geçerli bir JSON değil");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Dosya tanınmıyor — Luna Studio yedeği olmalı");
  }
  const partial = parsed as Partial<DataShape>;
  const hasPrompts = Array.isArray(partial.prompts);
  const hasChars = Array.isArray(partial.characters);
  const hasResults = Array.isArray(partial.results);
  if (!hasPrompts && !hasChars && !hasResults) {
    throw new Error("Dosyada prompt, karakter veya sonuç listesi bulunamadı");
  }

  const rawPrompts = hasPrompts ? (partial.prompts as unknown[]) : [];
  const rawChars = hasChars ? (partial.characters as unknown[]) : [];
  const rawResults = hasResults ? (partial.results as unknown[]) : [];

  const prompts = rawPrompts.map(normalizePrompt).filter((p): p is Prompt => p !== null);
  const characters = rawChars.map(normalizeCharacter).filter((c): c is CharacterProfile => c !== null);
  const results = rawResults.map(normalizeResult).filter((r): r is ResultEntry => r !== null);

  if (prompts.length === 0 && characters.length === 0 && results.length === 0) {
    throw new Error("Dosyada geçerli kayıt bulunamadı");
  }

  return {
    data: {
      prompts,
      characters,
      results,
      version: typeof partial.version === "number" ? partial.version : VERSION,
    },
    imported: {
      prompts: prompts.length,
      characters: characters.length,
      results: results.length,
    },
    skipped: {
      prompts: rawPrompts.length - prompts.length,
      characters: rawChars.length - characters.length,
      results: rawResults.length - results.length,
    },
  };
};

export const freshSeedData = (): DataShape => seededData();
