import React, { useState, useEffect } from 'react';
import {
  DAYS_DATA,
  ITINERARY_STOPS,
  HOTEL_INFO,
  BOOKING_ALERTS,
  EMERGENCY_CUTS,
  ItineraryStop,
} from './data/itineraryData';
import { ParisMap } from './components/ParisMap';
import { TimelineView } from './components/TimelineView';
import { ChecklistView } from './components/ChecklistView';
import { GuideSection } from './components/GuideSection';
import { FullInteractiveMapSection } from './components/FullInteractiveMapSection';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LocalDataBackupModal } from './components/LocalDataBackupModal';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Printer,
  Sparkles,
  Train,
  Compass,
  BookmarkCheck,
  AlertTriangle,
  Info,
  Maximize2,
  HardDrive,
  Download,
} from 'lucide-react';

import heroAutumn from './assets/images/paris_hero_autumn_1791576658682.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map' | 'checklist' | 'guide'>('itinerary');
  const [selectedDayId, setSelectedDayId] = useState<string>('lunedi');
  const [selectedStopId, setSelectedStopId] = useState<string | null>('stop-1');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);

  // Load checklist progress from localStorage
  const [completedStops, setCompletedStops] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('parigi_2026_completed_stops');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('parigi_2026_completed_stops', JSON.stringify(completedStops));
    } catch (e) {
      console.error(e);
    }
  }, [completedStops]);

  const handleToggleStop = (stopId: string) => {
    setCompletedStops((prev) => ({
      ...prev,
      [stopId]: !prev[stopId],
    }));
  };

  const handleResetChecklist = () => {
    if (window.confirm('Vuoi davvero azzerare tutte le spunte della checklist?')) {
      setCompletedStops({});
    }
  };

  const handleImportCompletedStops = (data: Record<string, boolean>) => {
    setCompletedStops(data);
  };

  const handleSelectOnMap = (stopId: string) => {
    setSelectedStopId(stopId);
    const targetStop = ITINERARY_STOPS.find((s) => s.id === stopId);
    if (targetStop) {
      setSelectedDayId(targetStop.dayId);
    }
    setActiveTab('map');
  };

  const checklistTotal = ITINERARY_STOPS.filter((s) => s.isChecklistItem).length;
  const completedCount = ITINERARY_STOPS.filter((s) => s.isChecklistItem && completedStops[s.id]).length;

  // Stops filtered for preview map in itinerary view according to selected day
  const mapStops = ITINERARY_STOPS.filter((s) => {
    if (selectedDayId === 'all') return true;
    return s.dayId === selectedDayId;
  });

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col selection:bg-amber-100">
      <OfflineIndicator />

      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-50 bg-[#faf8f5]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="text-lg sm:text-xl font-serif font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:text-amber-800 transition-colors"
          >
            Parigi 16–20 Novembre 2026
          </a>

          {/* Zone 2: 4 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'itinerary' ? 'text-amber-800 font-bold border-b-2 border-amber-800 pb-0.5' : ''
              }`}
            >
              Itinerario
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'map' ? 'text-amber-800 font-bold border-b-2 border-amber-800 pb-0.5' : ''
              }`}
            >
              Mappa Interattiva
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'checklist' ? 'text-amber-800 font-bold border-b-2 border-amber-800 pb-0.5' : ''
              }`}
            >
              Checklist 47 Tappe
              {completedCount > 0 && (
                <span className="ml-1.5 font-mono text-xs tabular-nums text-amber-700">
                  ({completedCount}/{checklistTotal})
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'guide' ? 'text-amber-800 font-bold border-b-2 border-amber-800 pb-0.5' : ''
              }`}
            >
              Guida & Regole
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton />
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-800 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
              title="Gestione e backup locale dei progressi"
            >
              <HardDrive className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Dati Locali</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-stone-200/60 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`px-2 py-1 rounded ${activeTab === 'itinerary' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'}`}
          >
            Itinerario
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2 py-1 rounded ${activeTab === 'map' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'}`}
          >
            Mappa
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-2 py-1 rounded ${activeTab === 'checklist' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'}`}
          >
            Checklist ({completedCount})
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-2 py-1 rounded ${activeTab === 'guide' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'}`}
          >
            Guida
          </button>
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="p-1 rounded text-stone-600 hover:text-stone-900"
            title="Dati locali"
          >
            <HardDrive className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Editorial Hero Presentation */}
        <section className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 text-white shadow-sm">
          <div className="absolute inset-0 z-0">
            <img
              src={heroAutumn}
              alt="Veduta d'autunno su Parigi e la Senna"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/70 to-stone-950/30" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl space-y-4">
            <div className="flex items-center gap-3 text-xs tracking-wider uppercase text-amber-300 font-medium">
              <span>Itinerario 100% Offline</span>
              <span aria-hidden="true">·</span>
              <span>16–20 Novembre 2026</span>
              <span aria-hidden="true">·</span>
              <span>47 Tappe Google Maps</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight text-balance">
              Parigi giorno per giorno: musei, bouillons, vintage e tramonti
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
              Hotel a <strong>Place de Clichy</strong> (metro 2 e 13). Arrivo lunedì 16 alle 11:00,
              partenza venerdì 20 alle 17:30. Orari programmati, linee di trasporto ottimali e
              indicazioni su cosa tagliare in caso di ritardo.
            </p>

            {/* Unboxed Metadata Strip (Zero-Pill Discipline) */}
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-300 font-medium">
              <span>Hotel Clichy (Metro 2 & 13)</span>
              <span aria-hidden="true">·</span>
              <span>Arrivo Lunedì 11:00</span>
              <span aria-hidden="true">·</span>
              <span>Partenza Venerdì 17:30</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300 font-mono tabular-nums">
                {completedCount} di {checklistTotal} tappe visitate
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">Salvataggio Locale Attivo</span>
            </div>
          </div>
        </section>

        {/* Tab 1: Itinerario Timeline */}
        {activeTab === 'itinerary' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Timeline (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-6">
              <TimelineView
                stops={ITINERARY_STOPS}
                selectedDayId={selectedDayId}
                onSelectDay={setSelectedDayId}
                selectedStopId={selectedStopId}
                onSelectStop={setSelectedStopId}
                completedStops={completedStops}
                onToggleStop={handleToggleStop}
                categoryFilter={categoryFilter}
                onSelectCategoryFilter={setCategoryFilter}
              />
            </div>

            {/* Right Column: Sticky Preview Map */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-700" />
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      Mappa Rapida
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors"
                  >
                    <span>Apri a tutto schermo</span>
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-xs text-stone-500 mt-2 mb-3">
                  I numeri sui pin corrispondono all'ordine delle tappe del giorno selezionato.
                </p>

                <div className="h-[440px] w-full">
                  <ParisMap
                    stops={mapStops}
                    selectedStopId={selectedStopId}
                    onSelectStop={setSelectedStopId}
                    selectedDayId={selectedDayId}
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-900 inline-block"></span>
                    <span>Hotel (Clichy)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-700 inline-block"></span>
                    <span>Tappe del giorno</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                    <span>Tappa selezionata</span>
                  </div>
                </div>
              </div>

              {/* Day Quick Summary Card */}
              <div className="bg-stone-100/90 border border-stone-200 rounded-xl p-4 text-xs space-y-2">
                <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-800" />
                  <span>Promemoria Logistica</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  I tempi di percorrenza sono stime: controlla sempre Google Maps prima di muoverti. Se sei in ritardo su una tappa, consulta subito la sezione <em>Cosa tagliare per primo</em>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dedicated Interactive Map Section */}
        {activeTab === 'map' && (
          <FullInteractiveMapSection
            completedStops={completedStops}
            onToggleStop={handleToggleStop}
          />
        )}

        {/* Tab 3: 47-Step Checklist View */}
        {activeTab === 'checklist' && (
          <ChecklistView
            completedStops={completedStops}
            onToggleStop={handleToggleStop}
            onResetChecklist={handleResetChecklist}
            onSelectOnMap={handleSelectOnMap}
          />
        )}

        {/* Tab 4: Complete Guide & Logistics View */}
        {activeTab === 'guide' && <GuideSection />}
      </main>

      {/* Local Data Backup Modal */}
      <LocalDataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        completedStops={completedStops}
        onImportCompletedStops={handleImportCompletedStops}
      />

      {/* Quiet Footer */}
      <footer className="mt-16 border-t border-stone-200 bg-white py-8 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-800 text-sm">Parigi 16–20 Novembre 2026</span>
            <span aria-hidden="true">·</span>
            <span>Itinerario 100% Locale & Offline</span>
          </div>
          <div className="flex items-center gap-4 text-stone-500">
            <span>Hotel Place de Clichy</span>
            <span aria-hidden="true">·</span>
            <span>Linee Metro 2 & 13</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="text-amber-800 hover:underline font-medium"
            >
              Backup Locale
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
