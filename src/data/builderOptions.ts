export const LOCATIONS = [
  "Cozy ev mutfağı",
  "Sabah yatak odası",
  "İstanbul sokağı",
  "Küçük kafe",
  "Müzik stüdyosu",
  "Gece restoran çıkışı",
  "Sahil yürüyüşü",
  "Ofis ortamı",
];

export const OUTFITS = [
  "Oversized beyaz gömlek",
  "Ribbed beyaz top",
  "Gri bodysuit tarzı üst",
  "Kot pantolon ve basic tişört",
  "Siyah blazer",
  "Casual elbise",
  "Müzik stüdyosu için deri ceket",
  "Ev rahat giyimi",
];

export const CAMERAS = [
  "Samsung telefon selfie",
  "Candid phone photo",
  "Profesyonel fotoğraf makinesi",
  "Paparazzi gece flaşı",
  "Uzaktan çekilmiş doğal fotoğraf",
  "Hafif motion blur",
  "Geniş açı telefon kamerası",
];

export const LIGHTS = [
  "Sabah doğal pencere ışığı",
  "Golden hour",
  "Loş kafe ışığı",
  "Gece sokak ışığı",
  "Konser kırmızı/mor ışık",
  "Bulutlu gün ışığı",
];

export const POSES = [
  "Kahve hazırlarken",
  "Sokakta yürürken",
  "Aynadan selfie",
  "Kameraya bakmadan",
  "Bass gitar tutarken",
  "Masada otururken",
  "Telefonla ilgilenirken",
  "Doğal gülümseme",
];

export const STYLES = [
  "Realistic candid",
  "Cozy natural",
  "Street style",
  "Soft editorial",
  "Home selfie",
  "Paparazzi night out",
  "Music studio",
  "Office assistant",
];

export const QUALITY_BITS = [
  "natural skin texture",
  "imperfect phone photo",
  "slight motion blur",
  "realistic lighting",
  "non-plastic skin",
  "believable candid composition",
  "not overly polished",
  "real-life camera feel",
];

export const NEGATIVE_BITS = [
  "overly perfect AI skin",
  "plastic face",
  "unrealistic body proportions",
  "distorted hands",
  "extra fingers",
  "fake luxury background",
  "overprocessed HDR",
  "cartoonish look",
  "blurry face",
  "inconsistent character face",
];

export const QUICK_ACTIONS: { label: string; append: string }[] = [
  { label: "Daha gerçekçi yap", append: "more realistic, natural skin texture, believable lighting, real-life camera feel" },
  { label: "Telefon fotoğrafı gibi yap", append: "shot on phone, candid phone photo, slight motion blur, imperfect framing, not overly polished" },
  { label: "Kusurları koru", append: "keep natural imperfections, visible skin pores, slight asymmetry, no smoothing, no AI gloss" },
  { label: "Yüz tutarlılığını güçlendir", append: "keep face consistent with reference, same facial features, identical jawline and eyes, lock character identity" },
  { label: "Daha cozy yap", append: "cozy warm atmosphere, soft warm light, intimate framing, calm relaxed mood" },
  { label: "Daha sinematik yap", append: "cinematic composition, filmic color grading, shallow depth of field, anamorphic feel" },
  { label: "AI görünümünü azalt", append: "reduce AI look, no plastic skin, no over-rendered detail, looks like a real photo not a render" },
  { label: "Negatif prompt ekle", append: "" }, // handled specially in editor
];
