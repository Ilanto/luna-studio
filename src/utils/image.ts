export interface ResizeResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
}

const readAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Dosya okunamadı"));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Resim çözümlenemedi"));
    img.src = src;
  });

const dataUrlSizeKb = (dataUrl: string): number => {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.round((base64.length * 0.75) / 1024);
};

export const resizeImageFile = async (
  file: File,
  maxDim = 1400,
  quality = 0.82
): Promise<ResizeResult> => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Bu bir resim dosyası değil");
  }
  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  // Eğer küçültme gerekmiyorsa ve dosya zaten küçükse direkt kullan
  if (scale === 1 && dataUrlSizeKb(dataUrl) < 350) {
    return { dataUrl, sizeKb: dataUrlSizeKb(dataUrl), width: img.width, height: img.height };
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { dataUrl, sizeKb: dataUrlSizeKb(dataUrl), width: img.width, height: img.height };
  }
  ctx.drawImage(img, 0, 0, w, h);
  // PNG yerine JPEG, daha küçük
  const out = canvas.toDataURL("image/jpeg", quality);
  return { dataUrl: out, sizeKb: dataUrlSizeKb(out), width: w, height: h };
};
