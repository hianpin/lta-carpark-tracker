import React, { useState } from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import {
  X,
  Navigation,
  Bookmark,
  Share2,
  Clock,
  Zap,
  ShieldCheck,
  CircleGauge,
  Sparkles,
  ExternalLink,
  Car,
  Bike,
  Truck,
  Calculator,
  AlertTriangle,
} from 'lucide-react';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (carparkId: string) => void;
  selectedVehicleType: VehicleType;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  onClose,
  isBookmarked,
  onToggleBookmark,
  selectedVehicleType,
}) => {
  const [estimatedHours, setEstimatedHours] = useState<number>(2);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  if (!carpark) return null;

  // Calculate estimated fee for selected duration
  const perHalfHour = (carpark.rates.perHalfHourCents || 60) / 100;
  const estimatedCost = Math.round(estimatedHours * 2 * perHalfHour * 100) / 100;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${carpark.name} - Real-time Carpark Availability`,
        text: `Check lot availability for ${carpark.name} on ParkSG: ${carpark.lots.cars.available} lots free.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `ParkSG: ${carpark.name} (${carpark.id}) has ${carpark.lots.cars.available} free car lots right now. Location: https://maps.google.com/?q=${carpark.coordinates.lat},${carpark.coordinates.lng}`
      );
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleNavigate = (platform: 'google' | 'waze' | 'apple') => {
    const { lat, lng } = carpark.coordinates;
    let url = '';
    if (platform === 'google') {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(
        carpark.name
      )}`;
    } else if (platform === 'waze') {
      url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    } else {
      url = `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(carpark.name)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-mono font-bold text-slate-700 px-1.5 py-0.5 bg-slate-200/80 rounded">
                {carpark.id}
              </span>
              <span aria-hidden="true">·</span>
              <span>{carpark.area}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-700">{carpark.agency}</span>
              <span aria-hidden="true">·</span>
              <span>{carpark.carparkType}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {carpark.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{carpark.address}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleBookmark(carpark.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'border-amber-300 bg-amber-50 text-amber-600'
                  : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title="Share carpark info"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {copiedShare && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 text-center font-medium">
            Link & carpark lot status copied to clipboard!
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Real-time Lot Breakdown Grid */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Real-Time Lots Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cars */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Car className="w-4 h-4 text-slate-700" />
                    Cars (Type C)
                  </span>
                  <span className="font-mono text-emerald-600 font-semibold">Live</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                    {carpark.lots.cars.available}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / {carpark.lots.cars.total} lots
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600"
                    style={{
                      width: `${Math.min(
                        100,
                        (carpark.lots.cars.available / carpark.lots.cars.total) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Motorcycles */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Bike className="w-4 h-4 text-slate-700" />
                    Motorcycles (Type Y)
                  </span>
                </div>
                {carpark.lots.motorcycles ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                        {carpark.lots.motorcycles.available}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / {carpark.lots.motorcycles.total} lots
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            100,
                            (carpark.lots.motorcycles.available / carpark.lots.motorcycles.total) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400 mt-2">No dedicated lots</div>
                )}
              </div>

              {/* Heavy Vehicles */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Truck className="w-4 h-4 text-slate-700" />
                    Heavy (Type H)
                  </span>
                </div>
                {carpark.lots.heavyVehicles ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                        {carpark.lots.heavyVehicles.available}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / {carpark.lots.heavyVehicles.total} lots
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-600"
                        style={{
                          width: `${Math.min(
                            100,
                            (carpark.lots.heavyVehicles.available /
                              carpark.lots.heavyVehicles.total) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400 mt-2">Not applicable</div>
                )}
              </div>
            </div>
          </div>

          {/* Historical Trend Sparkline */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">
                2-Hour Availability Trend
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Updated {carpark.lastUpdated}
              </span>
            </div>
            <div className="flex items-end gap-2 h-16 pt-2">
              {carpark.historyTrend.map((count, index) => {
                const maxVal = Math.max(...carpark.historyTrend, 10);
                const heightPercent = Math.max(15, (count / maxVal) * 100);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                      {count}
                    </span>
                    <div
                      className="w-full rounded-t bg-blue-500 hover:bg-blue-600 transition-colors"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-200">
              <span>-120 mins</span>
              <span>-60 mins</span>
              <span>Now</span>
            </div>
          </div>

          {/* Parking Rates & Regulations */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Parking Tariffs & Schemes
            </h4>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              <div className="p-3 flex items-start justify-between gap-4 text-xs">
                <span className="text-slate-500 font-medium">Weekday Daytime (Peak):</span>
                <span className="text-slate-900 font-semibold text-right">
                  {carpark.rates.weekdayPeak}
                </span>
              </div>
              <div className="p-3 flex items-start justify-between gap-4 text-xs">
                <span className="text-slate-500 font-medium">Evening & Night:</span>
                <span className="text-slate-900 font-semibold text-right">
                  {carpark.rates.weekdayOffpeak}
                </span>
              </div>
              <div className="p-3 flex items-start justify-between gap-4 text-xs">
                <span className="text-slate-500 font-medium">Sunday & Public Holidays:</span>
                <span className="text-slate-900 font-semibold text-right">
                  {carpark.rates.weekendSunday || 'Standard rates apply'}
                </span>
              </div>
              <div className="p-3 flex items-start justify-between gap-4 text-xs">
                <span className="text-slate-500 font-medium">Grace Period:</span>
                <span className="text-slate-900 font-semibold font-mono">
                  {carpark.rates.gracePeriodMins} minutes
                </span>
              </div>
              <div className="p-3 flex items-start justify-between gap-4 text-xs">
                <span className="text-slate-500 font-medium">System:</span>
                <span className="text-slate-900 font-medium">
                  {carpark.parkingSystem} (ERP 2.0 / CashCard / EZ-Link)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Parking Fee Estimator */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                Quick Parking Cost Estimator
              </h5>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs text-slate-600 block mb-1">Estimated Parking Duration:</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 4, 8].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setEstimatedHours(hrs)}
                      className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                        estimatedHours === hrs
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {hrs} hr{hrs > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500">Estimated Fee:</div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  ${estimatedCost.toFixed(2)} SGD
                </div>
              </div>
            </div>
          </div>

          {/* Key Infrastructure & Amenities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Height Clearance */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
              <CircleGauge className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Height Clearance: {carpark.heightLimit ? `${carpark.heightLimit}m` : 'Open / Unrestricted'}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {carpark.heightLimit && carpark.heightLimit < 2.0
                    ? 'Caution: Low ceiling height. Not suitable for tall vans or loaded roof racks.'
                    : 'Standard clearance suitable for most passenger cars and MPVs.'}
                </p>
              </div>
            </div>

            {/* EV Charging */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
              <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  {carpark.hasEVCharging ? 'EV Charging Available' : 'No EV Chargers Installed'}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {carpark.hasEVCharging
                    ? `${carpark.evChargerCount || 2} lots operated by ${carpark.evChargerOperator || 'SP Mobility'}`
                    : 'Standard parking lots only.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Coordinates:{' '}
            <span className="font-mono text-slate-700">
              {carpark.coordinates.lat.toFixed(4)}, {carpark.coordinates.lng.toFixed(4)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNavigate('apple')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Apple Maps
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('waze')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Waze
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('google')}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
