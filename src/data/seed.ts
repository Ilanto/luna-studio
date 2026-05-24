import type { Prompt, CharacterProfile, ResultEntry } from "../types";
import { defaultInclude } from "../types";

const iso = (d: string) => new Date(d).toISOString();

export const SEED_CHARACTERS: CharacterProfile[] = [
  {
    id: "char_luna",
    name: "Luna",
    overview:
      "Yetişkin, gerçekçi, doğal, cozy ve modern bir AI asistan karakteri. Aşırı plastik AI görünümü değil, gerçek bir insan gibi doğal.",
    faceHair:
      "Siyah çerçeveli gözlük. Koyu mürdüm / koyu auburn karışımı saç. Doğal yüz dokusu, görünür gözenekler, hafif asimetri. Belirgin kalın kaşlar, sıcak ifadeli gözler.",
    body: "Ortalama boy, sağlıklı doğal vücut tipi. Abartılı stüdyo proporsiyonları yok.",
    signatureOutfit:
      "Oversized beyaz gömlek, kot pantolon, basic ribbed top. Müzik stüdyosunda deri ceket. Akşamları sade siyah blazer.",
    locations:
      "İstanbul sokakları, küçük kafeler, ev mutfağı, sabah yatak odası, müzik stüdyosu, gece restoran çıkışları.",
    cameraStyle:
      "Candid telefon fotoğrafı hissi. Samsung telefon, Galaxy selfie, hafif motion blur. Bazen profesyonel kamera ama her zaman gerçek hissi.",
    keepFeatures:
      "Gözlük, saç tonu, yüz şekli, doğal cilt dokusu, doğal gülümseme, sıcak bakış.",
    avoidFeatures:
      "Plastik AI cildi, abartılı parlatma, sahte lüks arka plan, çizgi film bakışı, bozuk eller/parmaklar.",
    memory: {
      face:
        "natural skin texture, visible pores, slight asymmetry, warm expressive eyes, expressive eyebrows, soft natural smile, real-human imperfections, consistent character face across shots",
      hair:
        "medium-length dark auburn with subtle plum undertones, slightly tousled, soft natural strands, never glossy CGI hair",
      glasses:
        "thin black-framed square glasses, slight soft reflection on lenses, glasses always present in Luna shots",
      outfit:
        "oversized white shirt or ribbed top with casual jeans, sometimes a black blazer for evenings, leather jacket in music studio shots",
      camera:
        "candid phone photo feel, Samsung Galaxy front-camera vibe, slight motion blur, imperfect framing, realistic depth of field, real-life camera feel",
      avoid:
        "plastic AI skin, glossy face, overprocessed HDR, fake studio lighting, perfect symmetry, distorted hands, extra fingers, cartoonish look, inconsistent character face",
      fragments:
        "cozy natural mood, real-life camera feel, believable lighting, not overly polished, no AI gloss",
    },
    include: defaultInclude(),
    mainPrompt:
      "Luna — realistic adult woman, dark auburn-plum hair, black-framed glasses, warm expressive eyes, natural skin texture, candid phone photo, cozy lighting, real-life camera feel, consistent character face.",
    createdAt: iso("2026-05-20T09:00:00"),
    updatedAt: iso("2026-05-22T11:30:00"),
  },
];

export const SEED_PROMPTS: Prompt[] = [
  {
    id: "p_1",
    title: "Luna — yağmurlu kafe penceresi",
    category: "Luna",
    description:
      "İstanbul'da küçük bir kafe, yağmurlu cam kenarı, Samsung telefon ile çekilmiş candid bir an.",
    body: "Luna, sitting by a rainy cafe window in Istanbul, holding a small cup of filter coffee, looking outside, soft natural daylight, slight reflection on the glass, candid phone photo, Samsung Galaxy front camera feel, dark auburn-plum hair, black-framed glasses, oversized cream knit, natural skin texture, believable composition, not overly polished, real-life camera feel.",
    negative:
      "plastic face, overly perfect AI skin, distorted hands, extra fingers, fake luxury background, cartoonish look, blurry face, inconsistent character face",
    notes: "Cam yansıması güzel çıkıyor, gözlük çerçevesi belirgin kalsın.",
    tags: ["luna", "kafe", "yağmur", "telefon", "candid"],
    rating: 4,
    outcome: "Yüz iyi çıktı, ışık çok güzel. Eller bazen bozulabiliyor.",
    favorite: true,
    createdAt: iso("2026-05-21T10:00:00"),
    updatedAt: iso("2026-05-22T08:12:00"),
  },
  {
    id: "p_2",
    title: "Cozy ev — sabah mutfağı",
    category: "Gerçekçi Portre",
    description:
      "Sabah mutfak ışığında kahve hazırlayan doğal bir kare. Hiç AI hissi olmayacak şekilde.",
    body: "Realistic candid portrait of Luna preparing coffee in a cozy home kitchen, soft morning window light, steam rising from the cup, oversized white shirt, hair loosely tied, no makeup look, natural skin texture, visible pores, slight motion blur, shot on phone, imperfect framing, not overly polished.",
    negative:
      "plastic AI skin, glossy render, fake studio light, perfect symmetry, overprocessed HDR, cartoonish look",
    notes: "Buhar ve hafif blur birlikte çalışınca cozy çok güçlü oluyor.",
    tags: ["sabah", "mutfak", "kahve", "cozy", "natural"],
    rating: 5,
    outcome: "Çok doğal çıktı, telefon fotoğrafı hissi tam tutturdu.",
    favorite: true,
    createdAt: iso("2026-05-19T07:40:00"),
    updatedAt: iso("2026-05-20T12:00:00"),
  },
  {
    id: "p_3",
    title: "Müzik stüdyosu — bass denemesi",
    category: "Karakter Tasarımı",
    description:
      "Loş bir müzik stüdyosunda bass gitar tutarken, hafif paparazzi flaş hissi.",
    body: "Luna in a dim music studio holding a bass guitar, leather jacket, dark auburn hair catching warm tungsten light, slight grain, candid moment between takes, looking down at the strings, not posing for the camera, realistic depth of field, real-life camera feel, music studio mood.",
    negative:
      "overly polished, plastic skin, fake stage lighting, cartoonish look, distorted hands, extra fingers",
    notes: "Eller için ekstra negatif prompt iyi gidiyor.",
    tags: ["müzik", "stüdyo", "bass", "deri ceket"],
    rating: 4,
    outcome: "Atmosfer çok güzel. Bazen bass'in teli çok az çıkabiliyor.",
    favorite: false,
    createdAt: iso("2026-05-18T22:10:00"),
    updatedAt: iso("2026-05-18T22:10:00"),
  },
];

export const SEED_RESULTS: ResultEntry[] = [
  {
    id: "r_1",
    title: "Luna — kafe denemesi v3",
    promptId: "p_1",
    characterId: "char_luna",
    imageUrl: "",
    fitMode: "cover",
    resultType: "single",
    variations: [],
    variationNotes: "",
    model: "Midjourney",
    overall: 4,
    faceConsistency: 5,
    realism: 4,
    outfitAccuracy: 3,
    notes:
      "Yüz tutarlılığı çok iyi. Cam yansıması beklediğimden zarif çıktı. Bir sonraki denemede kıyafeti daha sade tutmayı dene.",
    issues: "Sol elin parmakları biraz garip. Kıyafet imzasından sapma var.",
    favorite: true,
    createdAt: iso("2026-05-22T14:20:00"),
    updatedAt: iso("2026-05-22T14:20:00"),
  },
  {
    id: "r_2",
    title: "Sabah mutfağı — Galaxy selfie test",
    promptId: "p_2",
    characterId: "char_luna",
    imageUrl: "",
    fitMode: "cover",
    resultType: "single",
    variations: [],
    variationNotes: "",
    model: "Gemini",
    overall: 5,
    faceConsistency: 5,
    realism: 5,
    outfitAccuracy: 4,
    notes: "Buhar + hafif blur kombinasyonu mükemmel. Sahici telefon fotoğrafı hissi tam tutturdu.",
    issues: "",
    favorite: true,
    createdAt: iso("2026-05-20T08:45:00"),
    updatedAt: iso("2026-05-20T08:45:00"),
  },
  {
    id: "r_3",
    title: "Müzik stüdyosu — bass v1",
    promptId: "p_3",
    characterId: "char_luna",
    imageUrl: "",
    fitMode: "cover",
    resultType: "single",
    variations: [],
    variationNotes: "",
    model: "Runway",
    overall: 3,
    faceConsistency: 4,
    realism: 3,
    outfitAccuracy: 4,
    notes: "Atmosfer güzel ama bass'in telleri yer yer kayboluyor.",
    issues: "Bass gitarın detayı bozuk. Yüz biraz fazla parlak.",
    favorite: false,
    createdAt: iso("2026-05-19T23:10:00"),
    updatedAt: iso("2026-05-19T23:10:00"),
  },
];
