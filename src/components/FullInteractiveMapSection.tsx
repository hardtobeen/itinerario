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
  ChevronLeft,
  ChevronRight,
  List,
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
  const [showMobileListDrawer, setShowMobileListDrawer] = useState<boolean>(false);

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
      try {
        const size = map.getSize();
        if (size && size.x > 0 && size.y > 0) {
          map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 14 });
        }
      } catch {
        // Safe fallback
      }
    }
  }, [filteredStops, selectedDayId, showPolyline, activeStop, completedStops]);

  // Center on activeStop when changed
  const handleSelectStop = (stop: ItineraryStop) => {
    setActiveStop(stop);
    setShowMobileListDrawer(false);
    const map = mapInstanceRef.current;
    if (map && stop.coordinates) {
      try {
        const size = map.getSize();
        if (size && size.x > 0 && size.y > 0) {
          map.flyTo(stop.coordinates, 15, { duration: 0.7 });
        } else {
          map.setView(stop.coordinates, 15);
        }
      } catch {
        map.setView(stop.coordinates, 15);
      }
      const marker = markersMapRef.current.get(stop.id);
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const handleStepNext = () => {
    if (!filteredStops.length) return;
    if (!activeStop) {
      handleSelectStop(filteredStops[0]);
      return;
    }
    const idx = filteredStops.findIndex((s) => s.id === activeStop.id);
    const nextIdx = (idx + 1) % filteredStops.length;
    handleSelectStop(filteredStops[nextIdx]);
  };

  const handleStepPrev = () => {
    if (!filteredStops.length) return;
    if (!activeStop) {
      handleSelectStop(filteredStops[filteredStops.length - 1]);
      return;
    }
    const idx = filteredStops.findIndex((s) => s.id === activeStop.id);
    const prevIdx = (idx - 1 + filteredStops.length) % filteredStops.length;
    handleSelectStop(filteredStops[prevIdx]);
  };

  const handleCenterParis = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    try {
      const size = map.getSize();
      if (size && size.x > 0 && size.y > 0) {
        map.flyTo([48.8606, 2.3376], 13);
      } else {
        map.setView([48.8606, 2.3376], 13);
      }
    } catch {
      map.setView([48.8606, 2.3376], 13);
    }
    setActiveStop(null);
  };

  const handleCenterHotel = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    try {
      const size = map.getSize();
      if (size && size.x > 0 && size.y > 0) {
        map.flyTo(HOTEL_INFO.coordinates, 15);
      } else {
        map.setView(HOTEL_INFO.coordinates, 15);
      }
    } catch {
      map.setView(HOTEL_INFO.coordinates, 15);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Controls Header */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-700" />
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Mappa Interattiva di Parigi
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              47 tappe georeferenziate, percorsi e base Clichy.
            </p>
          </div>

          {/* Quick utility buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={handleCenterHotel}
              className="min-h-[38px] px-3 text-xs font-medium rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <span className="w-2 h-2 rounded-full bg-stone-900 inline-block"></span>
              <span>Hotel Clichy</span>
            </button>
            <button
              onClick={handleCenterParis}
              className="min-h-[38px] px-3 text-xs font-medium rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-700" />
              <span>Centra</span>
            </button>
            <button
              onClick={() => setShowPolyline(!showPolyline)}
              className={`min-h-[38px] px-3 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 shrink-0 active:scale-95 ${
                showPolyline
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showPolyline ? 'Tracciato attivo' : 'Tracciato spento'}</span>
              <span className="sm:hidden">Rotte</span>
            </button>
            <button
              onClick={() => setShowMobileListDrawer(!showMobileListDrawer)}
              className="lg:hidden min-h-[38px] px-3 text-xs font-semibold rounded-xl bg-stone-900 text-white flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <List className="w-3.5 h-3.5" />
              <span>Elenco ({filteredStops.length})</span>
            </button>
          </div>
        </div>

        {/* Day Selector Bar: Horizontal Thumb-Friendly Swipe */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-stone-100">
          <button
            onClick={() => {
              setSelectedDayId('all');
              setActiveStop(null);
            }}
            className={`min-h-[36px] px-3 text-xs font-semibold rounded-xl transition-all shrink-0 active:scale-95 ${
              selectedDayId === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Tutti i 5 Giorni (47)
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
                className={`min-h-[36px] px-3 text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1 border-t border-stone-100">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto p-1 bg-stone-100 rounded-xl text-xs">
            {[
              { id: 'all', label: 'Tutte' },
              { id: 'culture', label: 'Monumenti' },
              { id: 'food', label: 'Cibo' },
              { id: 'shopping', label: 'Vintage' },
              { id: 'view', label: 'Panorami' },
              { id: 'night', label: 'Serate' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`min-h-[32px] px-2.5 font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 active:scale-95 ${
                  categoryFilter === cat.id
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cerca sulla mappa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-base sm:text-xs pl-8 pr-3 py-2 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-800"
            />
          </div>
        </div>
      </div>

      {/* Main Map Container + Responsive Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-[560px] sm:h-[620px] lg:h-[680px]">
        {/* Left Side: Full Map */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm h-full">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating Stop Inspector Card (Thumb-Friendly on iOS) */}
          {activeStop && (
            <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-sm z-[1000] bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                    {activeStop.number && <span className="font-semibold text-amber-800">Tappa #{activeStop.number}</span>}
                    <span>·</span>
                    <span className="font-semibold text-stone-900">{activeStop.time}</span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-stone-900 mt-0.5">
                    {activeStop.title}
                  </h4>
                </div>
                <button
                  onClick={() => setActiveStop(null)}
                  className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
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

              <p className="text-xs text-stone-700 mt-2 line-clamp-2 leading-relaxed">
                {activeStop.notes}
              </p>

              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleStepPrev}
                    className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center active:scale-90"
                    title="Tappa precedente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleStepNext}
                    className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center active:scale-90"
                    title="Tappa successiva"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {activeStop.isChecklistItem && (
                  <button
                    onClick={() => onToggleStop(activeStop.id)}
                    className={`min-h-[36px] px-3 text-xs rounded-xl font-medium transition-colors active:scale-95 ${
                      completedStops[activeStop.id]
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {completedStops[activeStop.id] ? '✓ Fatto' : 'Spunta'}
                  </button>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${activeStop.title} ${activeStop.address || 'Paris'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[36px] px-3 text-xs rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold transition-colors flex items-center gap-1 active:scale-95 shadow-xs"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Floating Map Legend on desktop */}
          <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl shadow-xs px-3 py-1.5 text-xs text-stone-700 hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-900 inline-block"></span>
              <span>Hotel</span>
            </div>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700 inline-block"></span>
              <span>Tappe</span>
            </div>
            <span className="text-stone-300">|</span>
            <span className="font-mono tabular-nums text-stone-500">{filteredStops.length} su mappa</span>
          </div>
        </div>

        {/* Right Side: Scrollable Stops Directory on Desktop / Drawer on Mobile */}
        <div
          className={`lg:col-span-4 bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm flex-col h-full overflow-hidden ${
            showMobileListDrawer
              ? 'fixed inset-x-2 bottom-20 top-24 z-50 flex shadow-2xl rounded-3xl'
              : 'hidden lg:flex'
          }`}
        >
          <div className="pb-3 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Elenco Tappe ({filteredStops.length})
              </h3>
              <p className="text-[11px] text-stone-500">Tocca per centrare la mappa</p>
            </div>
            {showMobileListDrawer && (
              <button
                onClick={() => setShowMobileListDrawer(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left active:scale-[0.99] ${
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
