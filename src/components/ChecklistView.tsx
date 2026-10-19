import React, { useState } from 'react';
import { ITINERARY_STOPS, DAYS_DATA, ItineraryStop } from '../data/itineraryData';
import { CheckSquare, Square, CheckCircle2, RotateCcw, ExternalLink, MapPin, AlertCircle, BookmarkCheck } from 'lucide-react';

interface ChecklistViewProps {
  completedStops: Record<string, boolean>;
  onToggleStop: (stopId: string) => void;
  onResetChecklist: () => void;
  onSelectOnMap: (stopId: string) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  completedStops,
  onToggleStop,
  onResetChecklist,
  onSelectOnMap,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 47 official checklist stops
  const checklistStops = ITINERARY_STOPS.filter(s => s.isChecklistItem);
  const totalStops = checklistStops.length;
  const completedCount = checklistStops.filter(s => completedStops[s.id]).length;
  const percent = Math.round((completedCount / totalStops) * 100);

  const filteredStops = checklistStops.filter(stop => {
    const isCompleted = !!completedStops[stop.id];
    if (filterMode === 'pending' && isCompleted) return false;
    if (filterMode === 'completed' && !isCompleted) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        stop.title.toLowerCase().includes(q) ||
        (stop.address && stop.address.toLowerCase().includes(q)) ||
        stop.notes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
      {/* Header & Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-amber-700" />
            <h2 className="text-2xl font-serif font-bold text-stone-900">Checklist delle 47 Tappe</h2>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Traccia il tuo viaggio in tempo reale. Le spunte rimangono salvate nel tuo browser.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-medium">Progresso</div>
            <div className="text-xl font-serif font-bold text-stone-900 tabular-nums">
              {completedCount} <span className="text-sm font-sans font-normal text-stone-500">/ {totalStops} ({percent}%)</span>
            </div>
          </div>
          <div className="w-24 bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-200">
            <div
              className="bg-amber-700 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <button
            onClick={onResetChecklist}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            title="Azzera checklist"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 border-b border-stone-100">
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterMode === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Tutte ({totalStops})
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterMode === 'pending' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Da visitare ({totalStops - completedCount})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterMode === 'completed' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Completate ({completedCount})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Cerca nella checklist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-800"
          />
        </div>
      </div>

      {/* Grouped by Day */}
      <div className="mt-6 space-y-8">
        {DAYS_DATA.map(day => {
          const dayStops = filteredStops.filter(s => s.dayId === day.id);
          if (dayStops.length === 0) return null;

          const dayCompleted = dayStops.filter(s => completedStops[s.id]).length;

          return (
            <div key={day.id} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg text-stone-900">
                    {day.dayName} {day.dateStr.split(' ')[0]} {day.dateStr.split(' ')[1]}
                  </span>
                  <span className="text-stone-400">·</span>
                  <span className="text-xs text-stone-500">{day.theme}</span>
                </div>
                <span className="text-xs font-mono text-stone-500 tabular-nums">
                  {dayCompleted}/{dayStops.length} completate
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {dayStops.map((stop) => {
                  const isChecked = !!completedStops[stop.id];
                  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${stop.title} ${stop.address || 'Paris'}`
                  )}`;

                  return (
                    <div
                      key={stop.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-stone-50/70 border-stone-200 text-stone-400 opacity-80'
                          : 'bg-white border-stone-200/80 hover:border-amber-700/50 hover:shadow-xs'
                      }`}
                    >
                      <button
                        onClick={() => onToggleStop(stop.id)}
                        className="mt-0.5 text-stone-400 hover:text-amber-800 transition-colors shrink-0"
                        title={isChecked ? 'Segna come non visitata' : 'Segna come visitata'}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-amber-700" />
                        ) : (
                          <Square className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`text-sm font-semibold truncate ${isChecked ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                            <span className="font-mono text-xs text-stone-400 mr-1.5 tabular-nums">#{stop.number}</span>
                            {stop.title}
                          </span>
                          <span className="text-xs font-mono text-stone-500 shrink-0 tabular-nums">
                            {stop.time}
                          </span>
                        </div>

                        {stop.address && (
                          <div className="text-xs text-stone-500 truncate mt-0.5">
                            {stop.address}
                          </div>
                        )}

                        {/* Badges / Alerts */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                          {stop.bookingRequired && (
                            <span className="text-amber-800 font-medium">
                              Prenotazione richiesta
                            </span>
                          )}
                          {stop.cutFirstIfLate && (
                            <span className="text-rose-700 font-medium">
                              Taglia per prima in ritardo
                            </span>
                          )}
                          {stop.needsVerification && (
                            <span className="text-indigo-700 font-medium">
                              Verifica pin/orario
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-stone-100 text-[11px]">
                          <button
                            onClick={() => onSelectOnMap(stop.id)}
                            className="text-stone-600 hover:text-amber-800 transition-colors flex items-center gap-1 font-medium"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Vedi su mappa</span>
                          </button>
                          <a
                            href={gmapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stone-600 hover:text-amber-800 transition-colors flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Google Maps</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
