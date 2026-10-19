import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
        <Check className="w-3 h-3 text-emerald-600" />
        <span>Installata Offline</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg transition-colors shadow-xs whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installa App Offline</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap"
        >
          <Smartphone className="w-3.5 h-3.5 text-stone-600" />
          <span>Installa su iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-stone-200 text-stone-900">
              <div className="flex items-start justify-between">
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Installa su iPhone / Safari
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs text-stone-600 leading-relaxed">
                <p>
                  1. Tocca l'icona <strong>Condividi</strong> (il quadrato con la freccia in alto) nella barra inferiore di Safari.
                </p>
                <p>
                  2. Scorri verso il basso e seleziona <strong>"Aggiungi alla schermata Home"</strong>.
                </p>
                <p>
                  3. L'itinerario e la mappa funzioneranno come un'app nativa <strong>100% offline</strong> anche nei sotterranei della metro di Parigi.
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-stone-900 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
              >
                Ho capito
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
