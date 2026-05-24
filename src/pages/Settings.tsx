import { useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { useStudio } from "../hooks/useStudio";
import { useToast } from "../hooks/useToast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { downloadJson, freshSeedData, importJson } from "../utils/storage";

export const Settings = () => {
  const { data, prompts, characters, results, replaceAll } = useStudio();
  const { push } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingImport, setPendingImport] = useState<null | { text: string; fileName: string }>(null);
  const [pendingSummary, setPendingSummary] = useState<string>("");

  const previewImport = async (file: File) => {
    try {
      const text = await file.text();
      const result = importJson(text);
      const lines: string[] = [];
      lines.push(
        `${result.imported.prompts} prompt, ${result.imported.characters} karakter, ${result.imported.results} sonuç içe aktarılacak.`
      );
      const skippedTotal =
        result.skipped.prompts + result.skipped.characters + result.skipped.results;
      if (skippedTotal > 0) {
        lines.push(
          `${result.skipped.prompts} prompt, ${result.skipped.characters} karakter ve ${result.skipped.results} sonuç tanınmadığı için atlanacak.`
        );
      }
      lines.push("Mevcut tüm veriler bu dosyayla değiştirilecek.");
      setPendingImport({ text, fileName: file.name });
      setPendingSummary(lines.join(" "));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Dosya okunamadı";
      push(msg, "danger");
    }
  };

  const applyImport = () => {
    if (!pendingImport) return;
    try {
      const result = importJson(pendingImport.text);
      replaceAll(result.data);
      push(
        `İçe aktarıldı: ${result.imported.prompts} prompt · ${result.imported.characters} karakter · ${result.imported.results} sonuç`,
        "success"
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Dosya okunamadı";
      push(msg, "danger");
    } finally {
      setPendingImport(null);
      setPendingSummary("");
    }
  };

  return (
    <div className="space-y-6 px-6 pb-28 pt-7 sm:px-10">
      <div className="stagger grid gap-6 lg:grid-cols-2">
        <div className="card card-hover p-7">
          <div className="chip-cream mb-3">
            <Download size={11} /> yedek
          </div>
          <div className="display text-2xl text-ink-100">Yedek al</div>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">
            Tüm promptlarını ve karakter profillerini tek bir JSON dosyasına indir.
            Bu dosyayı saklarsan başka bilgisayarda da geri yükleyebilirsin.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-y-2.5 text-xs text-ink-400">
            <div>Prompt sayısı</div><div className="text-right font-mono text-ink-100">{prompts.length}</div>
            <div>Karakter sayısı</div><div className="text-right font-mono text-ink-100">{characters.length}</div>
            <div>Sonuç sayısı</div><div className="text-right font-mono text-ink-100">{results.length}</div>
            <div>Veri sürümü</div><div className="text-right font-mono text-ink-100">v{data.version}</div>
          </div>
          <button onClick={() => downloadJson(data)} className="btn-primary mt-6 w-full justify-center">
            <Download size={15} /> JSON olarak indir
          </button>
        </div>

        <div className="card card-hover p-7">
          <div className="chip-wine mb-3">
            <Upload size={11} /> geri yükle
          </div>
          <div className="display text-2xl text-ink-100">İçe aktar</div>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">
            Daha önce yedeklediğin JSON dosyasını seçersen mevcut veriler onunla değiştirilir.
            Bozuk dosyalar otomatik olarak reddedilir, üzerine yazmadan önce onay sorulur.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) previewImport(f);
              e.target.value = "";
            }}
          />
          <button onClick={() => fileInput.current?.click()} className="btn mt-6 w-full justify-center">
            <Upload size={15} /> JSON dosyası seç
          </button>
        </div>
      </div>

      <div className="card relative overflow-hidden border-red-500/15 p-7 animate-fade-up">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-500/15 blur-3xl" />
        <div className="relative">
          <div className="chip border-red-500/35 bg-red-500/10 text-red-200">
            <RotateCcw size={11} /> tehlikeli alan
          </div>
          <div className="display mt-3 text-2xl text-ink-100">Her şeyi baştan başlat</div>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">
            Tüm verileri siler, uygulamayı örnek verilere döndürür. Önce yedek almayı unutma.
          </p>
          <button onClick={() => setConfirmReset(true)} className="btn-danger mt-5">
            <RotateCcw size={15} /> Verileri sıfırla
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Tüm verileri silelim mi?"
        message="Bu işlem geri alınamaz. Tüm promptların ve karakterlerin silinip örnek verilere dönülecek."
        confirmLabel="Evet, sıfırla"
        danger
        onConfirm={() => {
          replaceAll(freshSeedData());
          setConfirmReset(false);
          push("Veriler sıfırlandı", "success");
        }}
        onCancel={() => setConfirmReset(false)}
      />

      <ConfirmDialog
        open={!!pendingImport}
        title={pendingImport ? `"${pendingImport.fileName}" dosyasını yüklemek istiyor musun?` : ""}
        message={pendingSummary}
        confirmLabel="Evet, içeri aktar"
        cancelLabel="Vazgeç"
        onConfirm={applyImport}
        onCancel={() => { setPendingImport(null); setPendingSummary(""); }}
      />
    </div>
  );
};
