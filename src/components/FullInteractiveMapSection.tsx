import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  DAYS_DATA,
  ITINERARY_STOPS,
  HOTEL_INFO,
  ItineraryStop,
} from '../data/itineraryData';
import {
  Layers,
  MapPin,
  ExternalLink,
  Navigation,
  Compass,
  Search,
  CheckCircle2,
  Ticket,
  Scissors,
  AlertTriangle,
  Footprints,
  Calendar,
  X,
  ChevronRight,
} from 'lucide-react';

interface FullInteractiveMapSectionProps {
  completedStops: Record<string, boolean>;
  onToggleStop: (stopId: string) => void;
}

const DAY_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  lunedi: { bg: 'bg-amber-700', text: 'text-amber-700', hex: '#b45309' },
  martedi: { bg: 'bg-sky-700', text: 'text-sky-700', hex: '#0369a1' },
  mercoledi: { bg: 'bg-emerald-700', text: 'text-emerald-700', hex: '#047857' },
  giovedi: { bg: 'bg-purple-700', text: 'text-purple-700', hex: '#7e22ce' },
  venerdi: { bg: 'bg-rose-700', text: 'text-rose-700', hex: '#be123c' },
};

export const FullInteractiveMapSection: React.FC<FullInteractiveMapSectionProps> = ({
  completedStops,
  onToggleStop,
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStop, setActiveStop] = useState<ItineraryStop | null>(null);
  const [showPolyline, setShowPolyline] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Filter stops based on day, category, and search query
  const filteredStops = ITINERARY_STOPS.filter((stop) => {
    if (selectedDayId !== 'all' && stop.dayId !== selectedDayId) {
      return false;
    }
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

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [48.8606, 2.3376],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Warm, crisp CartoDB Voyager tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    markersMapRef.current.clear();

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const bounds: L.LatLngTuple[] = [];

    // Hotel marker
    const hotelIcon = L.divIcon({
      className: 'custom-hotel-marker',
      html: `
        <div style="
          background-color: #1c1917;
          color: white;
          width: 34px;
          height: 34px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          border: 2px solid #ffffff;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.05em;
        ">
          H
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const hotelMarker = L.marker(HOTEL_INFO.coordinates, { icon: hotelIcon })
      .bindPopup(`
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #78716c; letter-spacing: 0.05em; font-weight: 700;">Base Logistica</div>
          <div style="font-weight: 700; font-size: 14px; color: #1c1917; margin-top: 2px;">${HOTEL_INFO.name}</div>
          <div style="font-size: 12px; color: #57534e; margin-top: 4px;">📍 ${HOTEL_INFO.location}</div>
          <div style="font-size: 11px; color: #78716c; margin-top: 6px; line-height: 1.4;">${HOTEL_INFO.notes}</div>
        </div>
      `);
    markersGroup.addLayer(hotelMarker);
    bounds.push(HOTEL_INFO.coordinates);

    // Filter valid stops inside Paris coordinates
    const validStops = filteredStops.filter((s) => s.coordinates && s.coordinates[0] < 48.95);
    const routeCoords: L.LatLngTuple[] = [];

    validStops.forEach((stop) => {
      const isSelected = activeStop?.id === stop.id;
      const isVisited = !!completedStops[stop.id];
      const dayColor = DAY_COLORS[stop.dayId] || { hex: '#44403c' };

      const markerColor = isSelected ? '#ea580c' : isVisited ? '#78716c' : dayColor.hex;
      const size = isSelected ? 38 : 30;
      const label = stop.number ? `${stop.number}` : '•';

      const customIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            color: #ffffff;
            width: ${size}px;
            height: ${size}px;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: ${
              isSelected
                ? '0 0 0 5px rgba(234, 88, 12, 0.4), 0 6px 12px rgba(0,0,0,0.35)'
                : '0 2px 6px rgba(0,0,0,0.25)'
            };
            border: 2px solid #ffffff;
            font-size: ${stop.number && stop.number > 9 ? '11px' : '12px'};
            font-weight: 800;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            ${label}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const mapsQuery = encodeURIComponent(`${stop.title} ${stop.address || 'Paris'}`);
      const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

      const marker = L.marker(stop.coordinates, { icon: customIcon })
        .on('click', () => {
          setActiveStop(stop);
        })
        .bindPopup(`
          <div style="font-family: inherit; min-width: 220px; max-width: 260px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #78716c;">
              <span>${stop.number ? `Tappa #${stop.number}` : 'Tappa'}</span>
              <span style="font-weight: 700; color: #1c1917;">${stop.time}</span>
            </div>
            <div style="font-weight: 700; font-size: 15px; color: #1c1917; margin-top: 2px; line-height: 1.3;">
              ${stop.title}
            </div>
            ${stop.address ? `<div style="font-size: 12px; color: #57534e; margin-top: 4px;">📍 ${stop.address}</div>` : ''}
            <div style="font-size: 11px; color: #57534e; margin-top: 6px; line-height: 1.4;">${stop.notes}</div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e7e5e4; display: flex; justify-content: space-between; align-items: center;">
              <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #b45309; text-decoration: none; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                Apri su Google Maps ↗
              </a>
            </div>
          </div>
        `);

      markersGroup.addLayer(marker);
      markersMapRef.current.set(stop.id, marker);
      bounds.push(stop.coordinates);
      routeCoords.push(stop.coordinates);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Draw route path if enabled and a specific day is selected
    if (showPolyline && selectedDayId !== 'all' && routeCoords.length > 1) {
      const dayColor = DAY_COLORS[selectedDayId] || { hex: '#b45309' };
      const polyline = L.polyline(routeCoords, {
        color: dayColor.hex,
        weight: 3.5,
        opacity: 0.75,
        dashArray: '6, 8',
      }).addTo(map);
      routeLayerRef.current = polyline;
    }

    // Auto-fit bounds if no specific stop was clicked
    if (bounds.length > 0 && !activeStop) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 14 });
    }
  }, [filteredStops, selectedDayId, showPolyline, activeStop, completedStops]);

  // Center on activeStop when changed from sidebar
  const handleSelectStop = (stop: ItineraryStop) => {
    setActiveStop(stop);
    const map = mapInstanceRef.current;
    if (map && stop.coordinates) {
      map.flyTo(stop.coordinates, 15, { duration: 0.7 });
      const marker = markersMapRef.current.get(stop.id);
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const handleCenterParis = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([48.8606, 2.3376], 13);
    setActiveStop(null);
  };

  const handleCenterHotel = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(HOTEL_INFO.coordinates, 15);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-700" />
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Mappa Interattiva Completa di Parigi
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Esplora visivamente le 47 tappe, l'hotel a Place de Clichy e i percorsi consigliati giorno per giorno.
            </p>
          </div>

          {/* Quick utility buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCenterHotel}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-stone-900 inline-block"></span>
              <span>Hotel Clichy</span>
            </button>
            <button
              onClick={handleCenterParis}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-700" />
              <span>Centra Parigi</span>
            </button>
            <button
              onClick={() => setShowPolyline(!showPolyline)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                showPolyline
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>{showPolyline ? 'Tracciato attivo' : 'Tracciato spento'}</span>
            </button>
          </div>
        </div>

        {/* Day Selector Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
          <button
            onClick={() => {
              setSelectedDayId('all');
              setActiveStop(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedDayId === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Tutti i 5 Giorni (47 tappe)
          </button>
          {DAYS_DATA.map((day) => {
            const isSelected = selectedDayId === day.id;
            const color = DAY_COLORS[day.id];
            return (
              <button
                key={day.id}
                onClick={() => {
                  setSelectedDayId(day.id);
                  setActiveStop(null);
                }}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? `${color.bg} text-white font-semibold shadow-xs`
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>{day.dayName}</span>
                <span className={`text-[10px] font-mono tabular-nums ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                  ({day.stopsCount})
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-stone-100 rounded-lg text-xs">
            {[
              { id: 'all', label: 'Tutte le categorie' },
              { id: 'culture', label: 'Musei & Monumenti' },
              { id: 'food', label: 'Cibo & Bouillon' },
              { id: 'shopping', label: 'Vintage & Moda' },
              { id: 'view', label: 'Panorami' },
              { id: 'night', label: 'Serate & Jazz' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cerca punto sulla mappa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-800"
            />
          </div>
        </div>
      </div>

      {/* Main Map Container + Responsive Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-[680px]">
        {/* Left Side: Full Map (8 cols on desktop) */}
        <div className="lg:col-span-8 relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm h-full">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating Stop Inspector Overlay (when a stop is selected) */}
          {activeStop && (
            <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-sm z-[1000] bg-white/95 backdrop-blur-md border border-stone-200 rounded-xl p-4 shadow-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                    {activeStop.number && <span>Tappa #{activeStop.number}</span>}
                    <span>·</span>
                    <span className="font-semibold text-stone-900">{activeStop.time}</span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-stone-900 mt-0.5">
                    {activeStop.title}
                  </h4>
                </div>
                <button
                  onClick={() => setActiveStop(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeStop.address && (
                <div className="text-xs text-stone-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{activeStop.address}</span>
                </div>
              )}

              <div className="text-xs text-stone-600 mt-2 p-2 bg-stone-50 rounded-lg border border-stone-100">
                <span className="font-semibold text-stone-800">Tragitto: </span>
                {activeStop.transit}
              </div>

              <p className="text-xs text-stone-700 mt-2 leading-relaxed">
                {activeStop.notes}
              </p>

              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                {activeStop.isChecklistItem && (
                  <button
                    onClick={() => onToggleStop(activeStop.id)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      completedStops[activeStop.id]
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {completedStops[activeStop.id] ? '✓ Visitata' : 'Segna visitata'}
                  </button>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${activeStop.title} ${activeStop.address || 'Paris'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs rounded-md bg-amber-800 hover:bg-amber-900 text-white font-medium transition-colors flex items-center gap-1 ml-auto"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm border border-stone-200 rounded-lg shadow-sm px-3 py-2 text-xs text-stone-700 hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-900 inline-block"></span>
              <span>Hotel</span>
            </div>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700 inline-block"></span>
              <span>Tappa</span>
            </div>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
              <span>Selezionata</span>
            </div>
            <span className="text-stone-300">|</span>
            <span className="font-mono tabular-nums text-stone-500">{filteredStops.length} tappe mostrate</span>
          </div>
        </div>

        {/* Right Side: Scrollable Stops Directory (4 cols on desktop) */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="pb-3 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Elenco Tappe ({filteredStops.length})
            </h3>
            <span className="text-xs text-stone-500">Clicca per visualizzare</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
            {filteredStops.map((stop) => {
              const isSelected = activeStop?.id === stop.id;
              const isVisited = !!completedStops[stop.id];
              const dayColor = DAY_COLORS[stop.dayId] || { hex: '#44403c' };

              return (
                <div
                  key={stop.id}
                  onClick={() => handleSelectStop(stop)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-amber-700 bg-amber-50/40 shadow-xs ring-1 ring-amber-700'
                      : isVisited
                      ? 'border-stone-200 bg-stone-50/70 opacity-70'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {stop.number ? (
                        <span
                          className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                          style={{ backgroundColor: dayColor.hex }}
                        >
                          {stop.number}
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-600 text-[10px] flex items-center justify-center shrink-0">
                          •
                        </span>
                      )}
                      <h5 className={`text-sm font-semibold truncate ${isVisited ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                        {stop.title}
                      </h5>
                    </div>
                    <span className="text-xs font-mono text-stone-500 shrink-0 tabular-nums">
                      {stop.time}
                    </span>
                  </div>

                  {stop.address && (
                    <div className="text-xs text-stone-500 truncate mt-1 pl-7">
                      {stop.address}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2 pl-7 text-[11px]">
                    {stop.bookingRequired && (
                      <span className="text-amber-800 font-medium">Prenotazione</span>
                    )}
                    {stop.cutFirstIfLate && (
                      <span className="text-rose-700 font-medium">Taglia se tardi</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
