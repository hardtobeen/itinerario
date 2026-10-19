import React, { useState } from 'react';
import {
  DAYS_DATA,
  ItineraryStop,
  DayPlan,
} from '../data/itineraryData';
import {
  Clock,
  MapPin,
  ExternalLink,
  CheckSquare,
  Square,
  Ticket,
  Scissors,
  AlertTriangle,
  Compass,
  Footprints,
  Train,
  Sparkles,
  Search,
} from 'lucide-react';

interface TimelineViewProps {
  stops: ItineraryStop[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  selectedStopId: string | null;
  onSelectStop: (stopId: string) => void;
  completedStops: Record<string, boolean>;
  onToggleStop: (stopId: string) => void;
  categoryFilter: string;
  onSelectCategoryFilter: (category: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  stops,
  selectedDayId,
  onSelectDay,
  selectedStopId,
  onSelectStop,
  completedStops,
  onToggleStop,
  categoryFilter,
  onSelectCategoryFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const currentDayPlan = DAYS_DATA.find((d) => d.id === selectedDayId);

  // Filter stops
  const displayedStops = stops.filter((stop) => {
    // Day match
    if (selectedDayId !== 'all' && stop.dayId !== selectedDayId) {
      return false;
    }
    // Category match
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'culture' && stop.category !== 'museum' && stop.category !== 'monument') {
        return false;
      }
      if (categoryFilter === 'food' && stop.category !== 'food') {
        return false;
      }
      if (categoryFilter === 'shopping' && stop.category !== 'shopping') {
        return false;
      }
      if (categoryFilter === 'view' && stop.category !== 'walk_view') {
        return false;
      }
      if (categoryFilter === 'night' && stop.category !== 'nightlife') {
        return false;
      }
    }
    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        stop.title.toLowerCase().includes(q) ||
        (stop.address && stop.address.toLowerCase().includes(q)) ||
        stop.notes.toLowerCase().includes(q) ||
        stop.transit.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* iOS Ergonomic Day Selector: Horizontal Swipe on Mobile, Grid on Desktop */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-1.5 sm:p-2 shadow-xs">
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => onSelectDay('all')}
            className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl transition-all text-center shrink-0 sm:shrink active:scale-[0.98] ${
              selectedDayId === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 bg-stone-50 sm:bg-transparent hover:bg-stone-100'
            }`}
          >
            Tutti i 5 Giorni
          </button>
          {DAYS_DATA.map((day) => {
            const isSelected = selectedDayId === day.id;
            return (
              <button
                key={day.id}
                onClick={() => onSelectDay(day.id)}
                className={`min-h-[44px] min-w-[110px] sm:min-w-0 px-3 py-2 text-xs rounded-xl transition-all text-left flex flex-col justify-between shrink-0 sm:shrink active:scale-[0.98] ${
                  isSelected
                    ? 'bg-amber-800 text-white shadow-xs font-semibold ring-1 ring-amber-900/20'
                    : 'text-stone-700 bg-stone-50 sm:bg-transparent hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{day.dayName}</span>
                  <span className={`text-[10px] font-mono tabular-nums ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                    {day.stopsCount}
                  </span>
                </div>
                <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-amber-100' : 'text-stone-500'}`}>
                  {day.dateStr.split(' ')[0]} {day.dateStr.split(' ')[1]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Header Card */}
      {currentDayPlan && selectedDayId !== 'all' && (
        <div className="bg-stone-100/80 border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-amber-800 font-bold">
                {currentDayPlan.dateStr}
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 mt-0.5 leading-snug">
                {currentDayPlan.theme}
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 sm:mt-2 max-w-3xl leading-relaxed">
                {currentDayPlan.description}
              </p>
            </div>

            <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-stone-200/90 text-xs shrink-0 md:max-w-xs space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <Scissors className="w-3.5 h-3.5" />
                <span>Da tagliare se in ritardo:</span>
              </div>
              <p className="text-stone-600 leading-snug">{currentDayPlan.cutFirstSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Friendly Category & Search Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-stone-100/90 rounded-xl text-xs">
          {[
            { id: 'all', label: 'Tutto' },
            { id: 'culture', label: 'Monumenti & Musei' },
            { id: 'food', label: 'Cibo & Bouillon' },
            { id: 'shopping', label: 'Vintage & Moda' },
            { id: 'view', label: 'Panorami' },
            { id: 'night', label: 'Serate' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategoryFilter(cat.id)}
              className={`min-h-[36px] px-3 font-medium rounded-lg whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                categoryFilter === cat.id
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cerca per nome, via, orario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-base sm:text-xs pl-9 pr-3.5 py-2.5 sm:py-2 border border-stone-200/90 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/30 text-stone-800 shadow-xs"
          />
        </div>
      </div>

      {/* Timeline Steps List with Generous Touch Targets */}
      <div className="space-y-3 sm:space-y-4">
        {displayedStops.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs sm:text-sm">
            Nessuna tappa corrisponde ai filtri selezionati.
          </div>
        ) : (
          displayedStops.map((stop) => {
            const isSelected = stop.id === selectedStopId;
            const isChecked = !!completedStops[stop.id];
            const isLogistics = stop.category === 'logistics';

            const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${stop.title} ${stop.address || 'Paris'}`
            )}`;

            return (
              <div
                key={stop.id}
                onClick={() => onSelectStop(stop.id)}
                className={`relative group rounded-2xl border transition-all p-3.5 sm:p-4 cursor-pointer active:scale-[0.99] ${
                  isSelected
                    ? 'border-amber-700 bg-amber-50/30 shadow-md ring-1 ring-amber-700'
                    : isLogistics
                    ? 'border-dashed border-stone-300 bg-stone-50/80 hover:border-stone-400'
                    : isChecked
                    ? 'border-stone-200 bg-stone-50/70 opacity-80'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox with 44px Touch Target + Content */}
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    {/* Checkbox button: 44x44px touch hitbox for iOS thumbs */}
                    {stop.isChecklistItem ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStop(stop.id);
                        }}
                        className="w-11 h-11 -ml-2 -mt-2 flex items-center justify-center text-stone-400 hover:text-amber-800 active:scale-90 transition-transform shrink-0"
                        title={isChecked ? 'Completata' : 'Segna come completata'}
                        aria-label={isChecked ? 'Segna come non visitata' : 'Segna come visitata'}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-6 h-6 text-amber-700" />
                        ) : (
                          <Square className="w-6 h-6 text-stone-300 hover:text-stone-400" />
                        )}
                      </button>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center text-stone-400 shrink-0">
                        <Train className="w-4 h-4 text-stone-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md tabular-nums">
                          {stop.time}
                        </span>

                        {stop.number && (
                          <span className="text-xs font-mono font-semibold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md tabular-nums">
                            #{stop.number}
                          </span>
                        )}

                        <span className="text-xs text-stone-300">·</span>

                        <h4
                          className={`text-sm sm:text-base font-serif font-bold ${
                            isChecked ? 'line-through text-stone-500' : 'text-stone-900'
                          }`}
                        >
                          {stop.title}
                        </h4>
                      </div>

                      {stop.address && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{stop.address}</span>
                        </div>
                      )}

                      {/* Transit details */}
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-2 bg-stone-50 rounded-xl p-2 border border-stone-200/60">
                        <Footprints className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="font-medium text-stone-800">Tragitto:</span>
                        <span className="text-stone-600 truncate sm:text-clip">{stop.transit}</span>
                      </div>

                      {/* Notes / Tips from PDF */}
                      <div className="text-xs text-stone-700 mt-2 leading-relaxed">
                        <strong className="text-stone-900">Nota:</strong> {stop.notes}
                      </div>

                      {/* Badges / Warnings */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5 text-[11px] sm:text-xs">
                        {stop.bookingRequired && (
                          <div className="inline-flex items-center gap-1 text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md font-medium">
                            <Ticket className="w-3 h-3 text-amber-700" />
                            <span>Prenotazione a orario</span>
                          </div>
                        )}

                        {stop.cutFirstIfLate && (
                          <div className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md font-medium">
                            <Scissors className="w-3 h-3 text-rose-700" />
                            <span>Taglia se in ritardo</span>
                          </div>
                        )}

                        {stop.needsVerification && (
                          <div className="inline-flex items-center gap-1 text-indigo-900 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md font-medium">
                            <AlertTriangle className="w-3 h-3 text-indigo-600" />
                            <span>{stop.verificationReason || 'Verifica prima'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Touch-Friendly Buttons */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStop(stop.id);
                      }}
                      className="min-h-[34px] px-2.5 py-1 text-xs rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors flex items-center gap-1 active:scale-95"
                    >
                      <MapPin className="w-3 h-3" />
                      <span className="hidden sm:inline">Mappa</span>
                    </button>
                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="min-h-[34px] px-2.5 py-1 text-xs rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-medium transition-colors flex items-center gap-1 active:scale-95 shadow-2xs"
                      title="Apri indicazioni stradali su Google Maps"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden sm:inline">Naviga</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
