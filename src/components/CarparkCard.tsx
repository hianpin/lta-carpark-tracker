import React from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import {
  Navigation,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Bookmark,
  Clock,
  CircleGauge,
  Sparkles,
} from 'lucide-react';

interface CarparkCardProps {
  carpark: Carpark;
  isSelected: boolean;
  onSelect: (carpark: Carpark) => void;
  onOpenDetails: (carpark: Carpark) => void;
  selectedVehicleType: VehicleType;
  isBookmarked: boolean;
  onToggleBookmark: (carparkId: string) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  isSelected,
  onSelect,
  onOpenDetails,
  selectedVehicleType,
  isBookmarked,
  onToggleBookmark,
}) => {
  const lotInfo =
    selectedVehicleType === 'cars'
      ? carpark.lots.cars
      : selectedVehicleType === 'motorcycles'
      ? carpark.lots.motorcycles || carpark.lots.cars
      : carpark.lots.heavyVehicles || carpark.lots.cars;

  const available = lotInfo.available;
  const total = lotInfo.total;
  const percentage = total > 0 ? Math.round((available / total) * 100) : 0;

  // Status computation
  let statusBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let progressFill = 'bg-emerald-600';
  let statusText = 'Ample Lots';

  if (available === 0) {
    statusBadgeColor = 'text-slate-700 bg-slate-100 border-slate-300';
    progressFill = 'bg-slate-700';
    statusText = 'Lot Full';
  } else if (available < 10 || percentage < 8) {
    statusBadgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
    progressFill = 'bg-rose-600';
    statusText = 'Critical';
  } else if (available < 30 || percentage < 20) {
    statusBadgeColor = 'text-amber-800 bg-amber-50 border-amber-200';
    progressFill = 'bg-amber-500';
    statusText = 'Filling Fast';
  }

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const gmapUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}&destination_place_id=${encodeURIComponent(
      carpark.name
    )}`;
    window.open(gmapUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => onSelect(carpark)}
      className={`group relative rounded-xl border p-4 transition-all duration-150 cursor-pointer text-left ${
        isSelected
          ? 'border-blue-600 bg-blue-50/30 shadow-md ring-1 ring-blue-600/30'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Top Header: Carpark Code & Name + Bookmark */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
            <span className="font-mono font-medium text-slate-700">{carpark.id}</span>
            <span aria-hidden="true">·</span>
            <span>{carpark.area}</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-600">{carpark.agency}</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors truncate">
            {carpark.name}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-0.5">{carpark.address}</p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(carpark.id);
          }}
          className={`shrink-0 p-1.5 rounded-lg border transition-colors ${
            isBookmarked
              ? 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100'
              : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark carpark'}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark carpark'}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Primary Availability Bar & Figures */}
      <div className="mt-3 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {available}
            </span>
            <span className="text-xs text-slate-500">
              / <span className="font-mono tabular-nums">{total}</span> lots free
            </span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium border ${statusBadgeColor} whitespace-nowrap`}
          >
            {statusText}
          </span>
        </div>

        {/* Occupancy bar */}
        <div className="w-full bg-slate-200/90 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressFill} transition-all duration-300`}
            style={{ width: `${Math.min(100, Math.max(3, percentage))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
          <span>{percentage}% availability</span>
          <span className="flex items-center gap-1 font-mono text-slate-400">
            <Clock className="w-3 h-3" />
            {carpark.lastUpdated}
          </span>
        </div>
      </div>

      {/* Feature Indicators */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
        {carpark.heightLimit && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700">
            <CircleGauge className="w-3 h-3 text-slate-500" />
            <span className="font-mono">{carpark.heightLimit}m</span> clearance
          </span>
        )}

        {carpark.hasEVCharging && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 font-medium">
            <Zap className="w-3 h-3 text-emerald-600" />
            <span>EV Charge ({carpark.evChargerCount || 2})</span>
          </span>
        )}

        {carpark.hasFreeParkingScheme && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-100 font-medium">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Sun Free Parking</span>
          </span>
        )}

        {carpark.distanceKm !== undefined && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">
            <span>{carpark.distanceKm} km</span>
          </span>
        )}
      </div>

      {/* Footer Rate Snippet & Action Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-600 truncate max-w-[190px]">
          <span className="text-slate-400">Rate: </span>
          {carpark.rates.weekdayPeak}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(carpark);
            }}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
          >
            Details
          </button>
          <button
            type="button"
            onClick={handleNavigate}
            className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md flex items-center gap-1 transition-colors"
          >
            <Navigation className="w-3 h-3" />
            <span>Nav</span>
          </button>
        </div>
      </div>
    </div>
  );
};
