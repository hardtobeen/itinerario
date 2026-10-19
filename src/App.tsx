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
  BookOpen,
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
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col selection:bg-amber-100 pb-24 md:pb-0">
      <OfflineIndicator />

      {/* 3-Zone Top Bar Contract (Desktop + Compact Mobile Header) */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-stone-200/90 pt-safe">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="text-base sm:text-xl font-serif font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:text-amber-800 transition-colors"
          >
            Parigi 16–20 Nov 2026
          </a>

          {/* Zone 2: 4 clean single-line text navigation links (Desktop) */}
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

          {/* Zone 3: Actions (Desktop & Mobile) */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="min-h-[38px] px-2.5 sm:px-3.5 py-1 text-xs font-semibold text-stone-800 bg-white border border-stone-200/90 rounded-xl hover:bg-stone-50 active:scale-95 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-2xs"
              title="Gestione e backup locale dei progressi"
              aria-label="Dati locali e backup"
            >
              <HardDrive className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Dati Locali</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full space-y-4 sm:space-y-8">
        {/* Editorial Hero Presentation: Compact on Mobile, Full on Desktop */}
        <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 bg-stone-900 text-white shadow-xs">
          <div className="absolute inset-0 z-0">
            <img
              src={heroAutumn}
              alt="Veduta d'autunno su Parigi e la Senna"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/75 to-stone-950/40" />
          </div>

          <div className="relative z-10 p-4 sm:p-10 lg:p-12 max-w-3xl space-y-2 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs tracking-wider uppercase text-amber-300 font-semibold">
              <span>Itinerario 100% Locale</span>
              <span aria-hidden="true">·</span>
              <span>16–20 Novembre 2026</span>
              <span aria-hidden="true">·</span>
              <span>47 Tappe</span>
            </div>

            <h1 className="text-xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              Parigi giorno per giorno
            </h1>

            <p className="text-xs sm:text-base text-stone-300 leading-relaxed max-w-2xl">
              Hotel a <strong>Place de Clichy</strong> (metro 2 e 13). Arrivo lunedì 16 alle 11:00,
              partenza venerdì 20 alle 17:30. Orari, metro e note per ogni tappa.
            </p>

            {/* Unboxed Metadata Strip (Zero-Pill Discipline) */}
            <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-stone-300 font-medium">
              <span>Hotel Clichy (Metro 2 & 13)</span>
              <span aria-hidden="true">·</span>
              <span>Volo CDG</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300 font-mono tabular-nums font-semibold">
                {completedCount} di {checklistTotal} tappe visitate
              </span>
            </div>
          </div>
        </section>

        {/* Tab 1: Itinerario Timeline */}
        {activeTab === 'itinerary' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
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

            {/* Right Column: Sticky Preview Map (Desktop only, on mobile users have the bottom tab or dedicated section) */}
            <div className="hidden lg:block lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
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
                    <span>Espandi</span>
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
                    <span>Selezionata</span>
                  </div>
                </div>
              </div>

              {/* Day Quick Summary Card */}
              <div className="bg-stone-100/90 border border-stone-200 rounded-2xl p-4 text-xs space-y-2">
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

      {/* Native iOS Bottom Tab Bar (Mobile Only: Fixed, Frosted Glass, Touch Ergonomics) */}
      <nav
        aria-label="Navigazione rapida mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-stone-200/90 pb-safe shadow-lg"
      >
        <div className="grid grid-cols-4 items-center h-14">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex flex-col items-center justify-center h-full active:scale-90 transition-transform ${
              activeTab === 'itinerary' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">Itinerario</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center h-full active:scale-90 transition-transform ${
              activeTab === 'map' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">Mappa</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`relative flex flex-col items-center justify-center h-full active:scale-90 transition-transform ${
              activeTab === 'checklist' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <div className="relative">
              <BookmarkCheck className="w-5 h-5" />
              {completedCount > 0 && (
                <span className="absolute -top-1 -right-2.5 bg-amber-800 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center tabular-nums">
                  {completedCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex flex-col items-center justify-center h-full active:scale-90 transition-transform ${
              activeTab === 'guide' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">Guida</span>
          </button>
        </div>
      </nav>

      {/* Quiet Footer (Desktop) */}
      <footer className="hidden md:block mt-16 border-t border-stone-200 bg-white py-8 text-stone-500 text-xs">
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
