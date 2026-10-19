import React, { useState } from 'react';
import { Download, Upload, Copy, Check, HardDrive, X, RefreshCw } from 'lucide-react';

interface LocalDataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedStops: Record<string, boolean>;
  onImportCompletedStops: (data: Record<string, boolean>) => void;
}

export const LocalDataBackupModal: React.FC<LocalDataBackupModalProps> = ({
  isOpen,
  onClose,
  completedStops,
  onImportCompletedStops,
}) => {
  const [pasteContent, setPasteContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportPayload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    app: 'Parigi 16-20 Novembre 2026',
    completedStops,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parigi_2026_progress_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackMsg('File di backup scaricato con successo!');
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(completedStops));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      setFeedbackMsg('Codice di backup copiato negli appunti!');
    } catch {
      setFeedbackMsg('Impossibile copiare negli appunti.');
    }
  };

  const handleImport = () => {
    try {
      if (!pasteContent.trim()) {
        setFeedbackMsg('Incolla prima il testo del backup.');
        return;
      }
      const parsed = JSON.parse(pasteContent);
      const stopsData = parsed.completedStops || parsed;
      if (typeof stopsData === 'object' && stopsData !== null) {
        onImportCompletedStops(stopsData);
        setFeedbackMsg('Dati importati con successo!');
        setPasteContent('');
        setTimeout(() => onClose(), 1200);
      } else {
        setFeedbackMsg('Formato non valido.');
      }
    } catch {
      setFeedbackMsg('Errore nella lettura del codice JSON.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const stopsData = parsed.completedStops || parsed;
        if (typeof stopsData === 'object' && stopsData !== null) {
          onImportCompletedStops(stopsData);
          setFeedbackMsg('File caricato e dati sincronizzati!');
          setTimeout(() => onClose(), 1200);
        }
      } catch {
        setFeedbackMsg('File JSON non valido.');
      }
    };
    reader.readAsText(file);
  };

  const totalCompleted = Object.values(completedStops).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-stone-900">
        <div className="flex items-start justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Gestione Dati 100% Locale
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-600 mt-3 leading-relaxed">
          Tutti i dati dell'itinerario e le tue spunte sono salvati esclusivamente nella memoria
          locale del tuo browser (<strong>localStorage</strong>). Non serve alcun server online: puoi
          esportare o trasferire i tuoi progressi tra computer e smartphone in un attimo.
        </p>

        <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-500 font-medium">Stato memoria locale: </span>
            <strong className="text-stone-900 tabular-nums">{totalCompleted} su 47 tappe completate</strong>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px] bg-emerald-100/70 px-2 py-0.5 rounded">
            <span>● 100% Offline</span>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
            {feedbackMsg}
          </div>
        )}

        {/* Export Section */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            1. Esporta / Trasferisci sul telefono
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyClipboard}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-600" />}
              <span>{copied ? 'Copiato!' : 'Copia codice'}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-800 hover:bg-amber-900 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Scarica File Backup</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            2. Importa da un altro dispositivo
          </label>
          <div className="flex flex-col gap-2">
            <textarea
              rows={2}
              placeholder="Incolla qui il codice di backup da trasferire..."
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              className="w-full text-xs p-2.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 font-mono"
            />
            <div className="flex items-center justify-between gap-2">
              <label className="cursor-pointer text-xs font-medium text-amber-800 hover:text-amber-900 underline">
                <span>Oppure carica file .json</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleImport}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors"
              >
                Ripristina Dati
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
