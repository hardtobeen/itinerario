import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ItineraryStop, HOTEL_INFO } from '../data/itineraryData';
import { ExternalLink, Navigation } from 'lucide-react';

interface ParisMapProps {
  stops: ItineraryStop[];
  selectedStopId: string | null;
  onSelectStop: (stopId: string) => void;
  selectedDayId: string;
}

const DAY_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  lunedi: { bg: 'bg-amber-700', text: 'text-amber-700', hex: '#b45309' },
  martedi: { bg: 'bg-sky-700', text: 'text-sky-700', hex: '#0369a1' },
  mercoledi: { bg: 'bg-emerald-700', text: 'text-emerald-700', hex: '#047857' },
  giovedi: { bg: 'bg-purple-700', text: 'text-purple-700', hex: '#7e22ce' },
  venerdi: { bg: 'bg-rose-700', text: 'text-rose-700', hex: '#be123c' },
};

export const ParisMap: React.FC<ParisMapProps> = ({
  stops,
  selectedStopId,
  onSelectStop,
  selectedDayId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [48.8606, 2.3376],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Warm, elegant CartoDB Positron / OSM style
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

  // Update Markers & Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const bounds: L.LatLngTuple[] = [];

    // Add Hotel Marker
    const hotelIcon = L.divIcon({
      className: 'custom-hotel-marker',
      html: `
        <div style="background-color: #1c1917; color: white; width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); border: 2px solid #ffffff; font-size: 13px; font-weight: bold;">
          H
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const hotelMarker = L.marker(HOTEL_INFO.coordinates, { icon: hotelIcon })
      .bindPopup(`
        <div style="font-family: inherit; min-width: 180px; padding: 4px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #78716c; letter-spacing: 0.05em; font-weight: 600;">Base Logistica</div>
          <div style="font-weight: 700; font-size: 14px; color: #1c1917; margin-top: 2px;">${HOTEL_INFO.name}</div>
          <div style="font-size: 12px; color: #57534e; margin-top: 4px;">${HOTEL_INFO.location}</div>
          <div style="font-size: 11px; color: #a8a29e; margin-top: 6px;">${HOTEL_INFO.notes}</div>
        </div>
      `);
    markersGroup.addLayer(hotelMarker);
    bounds.push(HOTEL_INFO.coordinates);

    // Filter valid stops inside Paris coordinates (ignore airport CDG for bounds framing)
    const validStops = stops.filter(s => s.coordinates && s.coordinates[0] < 48.95);

    const latLngsForRoute: L.LatLngTuple[] = [];

    validStops.forEach((stop) => {
      const isSelected = stop.id === selectedStopId;
      const dayColor = DAY_COLORS[stop.dayId] || { hex: '#44403c' };
      const markerColor = isSelected ? '#ea580c' : dayColor.hex;
      const size = isSelected ? 36 : 28;
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
            box-shadow: ${isSelected ? '0 0 0 4px rgba(234, 88, 12, 0.35), 0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)'};
            border: 2px solid #ffffff;
            font-size: ${stop.number && stop.number > 9 ? '11px' : '12px'};
            font-weight: 700;
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
          onSelectStop(stop.id);
        })
        .bindPopup(`
          <div style="font-family: inherit; min-width: 210px; max-width: 250px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #78716c;">
              <span>${stop.number ? `Tappa #${stop.number}` : 'Tappa'}</span>
              <span style="font-weight: 600; color: #1c1917;">${stop.time}</span>
            </div>
            <div style="font-weight: 700; font-size: 14px; color: #1c1917; margin-top: 2px; line-height: 1.3;">${stop.title}</div>
            ${stop.address ? `<div style="font-size: 12px; color: #57534e; margin-top: 4px;">📍 ${stop.address}</div>` : ''}
            <div style="font-size: 11px; color: #78716c; margin-top: 6px; line-height: 1.4;">${stop.notes}</div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e7e5e4;">
              <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #b45309; text-decoration: none; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                Apri su Google Maps ↗
              </a>
            </div>
          </div>
        `);

      markersGroup.addLayer(marker);
      bounds.push(stop.coordinates);
      latLngsForRoute.push(stop.coordinates);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Draw route path if a specific day is selected
    if (selectedDayId !== 'all' && latLngsForRoute.length > 1) {
      const dayColor = DAY_COLORS[selectedDayId] || { hex: '#b45309' };
      const polyline = L.polyline(latLngsForRoute, {
        color: dayColor.hex,
        weight: 3,
        opacity: 0.7,
        dashArray: '6, 6',
      }).addTo(map);
      routeLayerRef.current = polyline;
    }

    // Fit map bounds
    if (bounds.length > 0 && selectedStopId === null) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 14 });
    }
  }, [stops, selectedStopId, selectedDayId, onSelectStop]);

  // Center on selected stop if changed
  useEffect(() => {
    if (!selectedStopId || !mapInstanceRef.current) return;
    const target = stops.find(s => s.id === selectedStopId);
    if (target && target.coordinates) {
      mapInstanceRef.current.flyTo(target.coordinates, 15, { duration: 0.8 });
    }
  }, [selectedStopId, stops]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    const validStops = stops.filter(s => s.coordinates && s.coordinates[0] < 48.95);
    const bounds = validStops.map(s => s.coordinates);
    bounds.push(HOTEL_INFO.coordinates);
    mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '420px' }} />

      {/* Floating Map Controls */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm border border-stone-200 rounded-lg shadow-sm px-3 py-2 text-xs text-stone-700 flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-900 inline-block"></span>
          <span>H Hotel (Clichy)</span>
        </div>
        <span className="text-stone-300">|</span>
        <div className="flex items-center gap-1">
          <span className="text-stone-500 font-mono tabular-nums">{stops.length}</span>
          <span>tappe su mappa</span>
        </div>
        <button
          onClick={handleResetView}
          className="ml-2 px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors text-[11px] font-medium flex items-center gap-1"
          title="Centra mappa"
        >
          <Navigation className="w-3 h-3" />
          <span>Centra</span>
        </button>
      </div>
    </div>
  );
};
