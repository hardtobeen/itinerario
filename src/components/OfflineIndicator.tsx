import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-stone-900/95 backdrop-blur-sm px-3.5 py-2 text-xs font-medium text-stone-100 shadow-xl border border-stone-700">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Modalità Offline attiva — Itinerario, note e checklist funzionano al 100% in locale.</span>
    </div>
  );
};
