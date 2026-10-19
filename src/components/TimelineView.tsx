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
    <div className="space-y-6">
      {/* Day Selector Segmented Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-2 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          <button
            onClick={() => onSelectDay('all')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all text-center ${
              selectedDayId === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
                className={`px-3 py-2 text-xs rounded-lg transition-all text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-800 text-white shadow-xs font-semibold'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{day.dayName}</span>
                  <span className={`text-[10px] font-mono tabular-nums ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                    {day.stopsCount} tappe
                  </span>
                </div>
                <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-amber-100' : 'text-stone-400'}`}>
                  {day.dateStr.split(' ')[0]} {day.dateStr.split(' ')[1]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Header Card (if a single day is selected) */}
      {currentDayPlan && selectedDayId !== 'all' && (
        <div className="bg-stone-100/70 border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-800 font-bold">
                {currentDayPlan.dateStr}
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
                {currentDayPlan.theme}
              </h3>
              <p className="text-xs text-stone-600 mt-2 max-w-3xl leading-relaxed">
                {currentDayPlan.description}
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-stone-200/90 text-xs shrink-0 md:max-w-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <Scissors className="w-3.5 h-3.5" />
                <span>Da tagliare se in ritardo:</span>
              </div>
              <p className="text-stone-600">{currentDayPlan.cutFirstSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters: Category & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-stone-100 rounded-lg text-xs">
          {[
            { id: 'all', label: 'Tutto' },
            { id: 'culture', label: 'Musei & Monumenti' },
            { id: 'food', label: 'Cibo & Bouillon' },
            { id: 'shopping', label: 'Vintage & Moda' },
            { id: 'view', label: 'Panorami & Parchi' },
            { id: 'night', label: 'Serate & Jazz' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategoryFilter(cat.id)}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Filtra tappe, orari o vie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-800"
          />
        </div>
      </div>

      {/* Timeline Steps List */}
      <div className="space-y-4">
        {displayedStops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-stone-200 text-stone-500">
            Nessuna tappa corrisponde ai filtri selezionati.
          </div>
        ) : (
          displayedStops.map((stop, idx) => {
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
                className={`relative group rounded-xl border transition-all p-4 cursor-pointer ${
                  isSelected
                    ? 'border-amber-700 bg-amber-50/20 shadow-md ring-1 ring-amber-700'
                    : isLogistics
                    ? 'border-dashed border-stone-300 bg-stone-50/80 hover:border-stone-400'
                    : isChecked
                    ? 'border-stone-200 bg-stone-50/60 opacity-75'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  {/* Left: Time and Title */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Checkbox for official 47 checklist items */}
                    {stop.isChecklistItem ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStop(stop.id);
                        }}
                        className="mt-0.5 text-stone-400 hover:text-amber-800 transition-colors shrink-0"
                        title={isChecked ? 'Completata' : 'Segna come completata'}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-amber-700" />
                        ) : (
                          <Square className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                        )}
                      </button>
                    ) : (
                      <div className="mt-1 w-5 flex justify-center text-stone-400 shrink-0">
                        <Train className="w-4 h-4 text-stone-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded tabular-nums">
                          {stop.time}
                        </span>

                        {stop.number && (
                          <span className="text-xs font-mono font-semibold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded tabular-nums">
                            Tappa #{stop.number}
                          </span>
                        )}

                        <span className="text-xs text-stone-400">·</span>

                        <h4
                          className={`text-base font-serif font-bold ${
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
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2 bg-stone-50 rounded-lg p-2 border border-stone-200/60">
                        <Footprints className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="font-medium text-stone-700">Come ci arrivi:</span>
                        <span className="text-stone-600">{stop.transit}</span>
                      </div>

                      {/* Notes / Tips from PDF */}
                      <div className="text-xs text-stone-700 mt-2 leading-relaxed">
                        <strong className="text-stone-900">Nota:</strong> {stop.notes}
                      </div>

                      {/* Badges / Warnings */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                        {stop.bookingRequired && (
                          <div className="inline-flex items-center gap-1 text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-medium">
                            <Ticket className="w-3.5 h-3.5 text-amber-700" />
                            <span>Prenotazione a orario richiesta</span>
                          </div>
                        )}

                        {stop.cutFirstIfLate && (
                          <div className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md font-medium">
                            <Scissors className="w-3.5 h-3.5 text-rose-700" />
                            <span>Da tagliare per prima se in ritardo</span>
                          </div>
                        )}

                        {stop.needsVerification && (
                          <div className="inline-flex items-center gap-1 text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{stop.verificationReason || 'Verifica prima di andare'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStop(stop.id);
                      }}
                      className="px-2.5 py-1 text-xs rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Su Mappa</span>
                    </button>
                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 text-xs rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Google Maps</span>
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
