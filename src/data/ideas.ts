export const DAILY_IDEAS: string[] = [
  "Bugün Luna'yı cozy bir İstanbul kafesinde, yağmurlu cam kenarında, Samsung telefon fotoğrafı gibi dene.",
  "Sabah ışığında yatak odasında, oversized beyaz gömlek, yüz çok az dağınık — telefon selfie hissi olsun.",
  "Müzik stüdyosunda bass tutarken, tungsten ışık, paparazzi flaş yok ama candid bir an yakala.",
  "Gece restoran çıkışı, paparazzi flaşı, hafif motion blur — abartısız, doğal hissi koru.",
  "Sahil yürüyüşü, golden hour, kameraya bakmadan profile çekim, hafif rüzgar saçta.",
  "Loş kafede dizüstü bilgisayar başında, ekran ışığı yüze düşsün, candid ofis hissi.",
  "Sabah mutfağında kahve hazırlarken, buhar yükselirken, hafif blur ile gerçek bir an.",
  "Müzik stüdyosu — deri ceket, kulaklık boynunda, mikser önünde ama poz vermiyor.",
];

export const pickIdeaForToday = (): string => {
  const today = new Date();
  const seed = today.getFullYear() * 372 + (today.getMonth() + 1) * 31 + today.getDate();
  return DAILY_IDEAS[seed % DAILY_IDEAS.length];
};
