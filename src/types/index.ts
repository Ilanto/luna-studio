export type Category =
  | "Luna"
  | "Gerçekçi Portre"
  | "Video Prompt"
  | "UI / Dashboard"
  | "Ürün Tanıtımı"
  | "Karakter Tasarımı"
  | "Mekan / Atmosfer"
  | "Deneme / Test";

export const CATEGORIES: Category[] = [
  "Luna",
  "Gerçekçi Portre",
  "Video Prompt",
  "UI / Dashboard",
  "Ürün Tanıtımı",
  "Karakter Tasarımı",
  "Mekan / Atmosfer",
  "Deneme / Test",
];

export interface Prompt {
  id: string;
  title: string;
  category: Category;
  description: string;
  body: string;
  negative: string;
  notes: string;
  tags: string[];
  rating: number; // 0-5
  outcome: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CHARACTER_MEMORY_KEYS = [
  "face",
  "hair",
  "glasses",
  "outfit",
  "camera",
  "avoid",
  "fragments",
] as const;
export type CharacterMemoryKey = (typeof CHARACTER_MEMORY_KEYS)[number];

export type CharacterMemory = Record<CharacterMemoryKey, string>;
export type CharacterInclude = Record<CharacterMemoryKey, boolean>;

export const defaultMemory = (): CharacterMemory => ({
  face: "",
  hair: "",
  glasses: "",
  outfit: "",
  camera: "",
  avoid: "",
  fragments: "",
});

export const defaultInclude = (): CharacterInclude => ({
  face: true,
  hair: true,
  glasses: true,
  outfit: true,
  camera: true,
  avoid: true,
  fragments: true,
});

export interface MemoryFieldMeta {
  key: CharacterMemoryKey;
  label: string;
  description: string;
  placeholder: string;
  targetsNegative?: boolean;
}

export const MEMORY_FIELDS: MemoryFieldMeta[] = [
  {
    key: "face",
    label: "Yüz tutarlılığı",
    description: "Yüz şekli, ifade, cilt dokusu — her sahnede aynı kalsın diye.",
    placeholder: "natural skin texture, visible pores, slight asymmetry, warm expressive eyes...",
  },
  {
    key: "hair",
    label: "Saç notları",
    description: "Saç tonu, uzunluk, doku.",
    placeholder: "medium-length dark auburn with plum undertones, slightly tousled...",
  },
  {
    key: "glasses",
    label: "Gözlük notları",
    description: "Gözlüğün stili, kalınlığı, varlığı.",
    placeholder: "thin black-framed square glasses, light reflection on lenses...",
  },
  {
    key: "outfit",
    label: "Kıyafet imzası",
    description: "Karaktere özgü stil. Builder'da kıyafet seçilirse bununla birlikte gider.",
    placeholder: "oversized white shirt, casual jeans, sometimes a black blazer...",
  },
  {
    key: "camera",
    label: "Kamera gerçekliği",
    description: "Çekim hissi — kamera tipi, framing, atmosfer.",
    placeholder: "candid phone photo feel, Samsung Galaxy front camera vibe...",
  },
  {
    key: "avoid",
    label: "Kaçınılacaklar",
    description: "Negatif prompta otomatik olarak eklenir.",
    placeholder: "plastic AI skin, glossy face, distorted hands, cartoonish look...",
    targetsNegative: true,
  },
  {
    key: "fragments",
    label: "Favori prompt parçaları",
    description: "Her sahnede gizli imza gibi tekrar eden ifadelerin.",
    placeholder: "cozy natural mood, real-life camera feel, believable lighting...",
  },
];

export interface CharacterProfile {
  id: string;
  name: string;
  overview: string;

  // Genel notlar (biyografi — insan için)
  faceHair: string;
  body: string;
  signatureOutfit: string;
  locations: string;
  cameraStyle: string;
  keepFeatures: string;
  avoidFeatures: string;

  // Karakter hafızası (prompta enjekte edilen)
  memory: CharacterMemory;
  include: CharacterInclude;

  mainPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuilderSelection {
  characterId?: string;
  location?: string;
  outfit?: string;
  camera?: string;
  light?: string;
  pose?: string;
  style?: string;
  qualityBits: string[];
  negativeBits: string[];
}

export type AIModel =
  | "ChatGPT"
  | "Midjourney"
  | "Gemini"
  | "Grok"
  | "Minimax"
  | "Kling"
  | "Runway"
  | "Diğer";

export const AI_MODELS: AIModel[] = [
  "ChatGPT",
  "Midjourney",
  "Gemini",
  "Grok",
  "Minimax",
  "Kling",
  "Runway",
  "Diğer",
];

export type FitMode = "cover" | "contain";
export const FIT_MODES: FitMode[] = ["cover", "contain"];

export type ResultType = "single" | "grid" | "video";
export const RESULT_TYPES: ResultType[] = ["single", "grid", "video"];

export const RESULT_TYPE_LABEL: Record<ResultType, string> = {
  single: "Tek görsel",
  grid: "Grid / varyasyon",
  video: "Video denemesi",
};

export interface Variation {
  id: string;
  label: string;
  overall: number;
  faceConsistency: number;
  realism: number;
  outfitAccuracy: number;
  notes: string;
  issues: string;
  isWinner: boolean;
}

export const blankVariation = (idx: number): Variation => ({
  id: `v_${idx + 1}_${Math.random().toString(36).slice(2, 9)}`,
  label: `V${idx + 1}`,
  overall: 0,
  faceConsistency: 0,
  realism: 0,
  outfitAccuracy: 0,
  notes: "",
  issues: "",
  isWinner: false,
});

export const defaultVariations = (n = 4): Variation[] =>
  Array.from({ length: n }, (_, i) => blankVariation(i));

export interface ResultEntry {
  id: string;
  title: string;
  promptId: string | null;
  characterId: string | null;
  imageUrl: string;
  model: AIModel;
  fitMode: FitMode;
  resultType: ResultType;
  variations: Variation[];
  variationNotes: string;
  overall: number;
  faceConsistency: number;
  realism: number;
  outfitAccuracy: number;
  notes: string;
  issues: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DataShape {
  prompts: Prompt[];
  characters: CharacterProfile[];
  results: ResultEntry[];
  version: number;
}
