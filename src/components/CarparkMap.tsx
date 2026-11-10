import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Carpark, VehicleType } from '../types/carpark';

interface CarparkMapProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  selectedVehicleType: VehicleType;
  userLocation: { lat: number; lng: number } | null;
  centerCoordinates?: { lat: number; lng: number; zoom?: number } | null;
}

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  selectedVehicleType,
  userLocation,
  centerCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Singapore default center
    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: true,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
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

  // Update center when centerCoordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !centerCoordinates) return;
    mapInstanceRef.current.flyTo(
      [centerCoordinates.lat, centerCoordinates.lng],
      centerCoordinates.zoom || 14,
      { duration: 1.0 }
    );
  }, [centerCoordinates]);

  // Update User Location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-blue-500/20 animate-ping absolute"></div>
            <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        })
          .addTo(mapInstanceRef.current)
          .bindTooltip('Your Location', { permanent: false, direction: 'top' });
      }
    } else if (userMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  // Render Carpark Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    carparks.forEach((carpark) => {
      const lotInfo =
        selectedVehicleType === 'cars'
          ? carpark.lots.cars
          : selectedVehicleType === 'motorcycles'
          ? carpark.lots.motorcycles || carpark.lots.cars
          : carpark.lots.heavyVehicles || carpark.lots.cars;

      const available = lotInfo.available;
      const total = lotInfo.total;
      const percentage = total > 0 ? (available / total) * 100 : 0;
      const isSelected = selectedCarpark?.id === carpark.id;

      // Color coding logic
      let badgeBg = 'bg-emerald-600 text-white';
      let statusText = 'Ample';
      if (available === 0) {
        badgeBg = 'bg-slate-800 text-slate-200';
        statusText = 'Full';
      } else if (available < 10 || percentage < 8) {
        badgeBg = 'bg-rose-600 text-white';
        statusText = 'Scarce';
      } else if (available < 30 || percentage < 20) {
        badgeBg = 'bg-amber-600 text-white';
        statusText = 'Limited';
      }

      const ringClass = isSelected ? 'ring-4 ring-blue-600 scale-110 z-50' : 'hover:scale-105';

      const customHtml = `
        <div class="cursor-pointer transition-transform duration-150 ${ringClass} flex flex-col items-center">
          <div class="px-2 py-1 rounded-md shadow-md flex items-center gap-1.5 text-xs font-semibold ${badgeBg} border border-white/80 whitespace-nowrap">
            <span class="font-mono text-xs tabular-nums">${available}</span>
            <span class="text-[10px] uppercase tracking-wide opacity-80">${carpark.agency}</span>
          </div>
          <div class="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.5 shadow-xs"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-carpark-pin',
        html: customHtml,
        iconSize: [60, 32],
        iconAnchor: [30, 30],
      });

      const marker = L.marker([carpark.coordinates.lat, carpark.coordinates.lng], {
        icon,
        title: carpark.name,
      });

      // Marker Click
      marker.on('click', () => {
        onSelectCarpark(carpark);
      });

      // Popup preview
      const popupHtml = `
        <div class="p-3 text-slate-800 text-sm max-w-xs font-sans">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-bold text-slate-900 leading-tight">${carpark.name}</span>
            <span class="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 rounded text-slate-700">${carpark.agency}</span>
          </div>
          <p class="text-xs text-slate-500 mb-2 truncate">${carpark.address}</p>
          <div class="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
            <div>
              <span class="text-slate-500">Available:</span>
              <span class="font-mono font-bold text-slate-900 ml-1">${available} / ${total}</span>
            </div>
            <div class="font-medium text-slate-600">${statusText}</div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            ${carpark.rates.weekdayPeak}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false });
      markersLayerRef.current?.addLayer(marker);
    });
  }, [carparks, selectedCarpark, onSelectCarpark, selectedVehicleType]);

  // Center on selected carpark
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCarpark) return;
    mapInstanceRef.current.flyTo(
      [selectedCarpark.coordinates.lat, selectedCarpark.coordinates.lng],
      16,
      { duration: 0.8 }
    );
  }, [selectedCarpark]);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Quick Legend Overlay in bottom corner */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200/80 rounded-lg shadow-sm px-3 py-2 text-xs text-slate-700 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600"></span>
          <span>Ample (&gt;20%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-amber-600"></span>
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-rose-600"></span>
          <span>Scarce</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-800"></span>
          <span>Full</span>
        </div>
      </div>
    </div>
  );
};
