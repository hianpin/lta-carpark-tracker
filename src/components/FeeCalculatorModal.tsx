import React, { useState } from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import { X, Calculator, Clock, Car, Bike, Sparkles, AlertCircle } from 'lucide-react';

interface FeeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  carparks: Carpark[];
  defaultCarparkId?: string;
}

export const FeeCalculatorModal: React.FC<FeeCalculatorModalProps> = ({
  isOpen,
  onClose,
  carparks,
  defaultCarparkId,
}) => {
  const [selectedCarparkId, setSelectedCarparkId] = useState<string>(
    defaultCarparkId || (carparks[0]?.id ?? '')
  );
  const [vehicleType, setVehicleType] = useState<VehicleType>('cars');
  const [entryTime, setEntryTime] = useState<string>('09:00');
  const [exitTime, setExitTime] = useState<string>('12:30');
  const [isSunday, setIsSunday] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentCarpark = carparks.find((c) => c.id === selectedCarparkId) || carparks[0];

  // Calculate duration in minutes
  const parseTimeToMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const startMins = parseTimeToMins(entryTime);
  let endMins = parseTimeToMins(exitTime);
  if (endMins < startMins) endMins += 24 * 60; // Cross midnight
  const durationMins = Math.max(0, endMins - startMins);
  const durationHours = Math.floor(durationMins / 60);
  const remainderMins = durationMins % 60;

  // Calculation Logic
  let estimatedFee = 0;
  let feeBreakdownNote = '';

  if (currentCarpark) {
    if (durationMins <= currentCarpark.rates.gracePeriodMins) {
      estimatedFee = 0;
      feeBreakdownNote = `Waived within ${currentCarpark.rates.gracePeriodMins}-minute grace period.`;
    } else if (isSunday && currentCarpark.hasFreeParkingScheme && startMins >= 420 && endMins <= 1350) {
      estimatedFee = 0;
      feeBreakdownNote = 'Covered under HDB Sunday Free Parking Scheme (07:00 - 22:30).';
    } else if (vehicleType === 'motorcycles') {
      estimatedFee = 0.65; // Singapore HDB standard per entry/whole day cap
      feeBreakdownNote = 'Standard Singapore motorcycle flat rate per session ($0.65).';
    } else {
      // Calculate half-hour blocks
      const halfHourBlocks = Math.ceil(durationMins / 30);
      const perHalfHour = (currentCarpark.rates.perHalfHourCents || 60) / 100;
      estimatedFee = Math.round(halfHourBlocks * perHalfHour * 100) / 100;
      feeBreakdownNote = `${halfHourBlocks} half-hour block(s) @ $${perHalfHour.toFixed(2)} / 30 mins`;
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Singapore Parking Fee Calculator</h3>
              <p className="text-xs text-slate-500">Estimate parking tariffs with grace periods & Sunday FPS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Carpark Picker */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Carpark:</label>
            <select
              value={selectedCarparkId}
              onChange={(e) => setSelectedCarparkId(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:border-blue-500"
            >
              {carparks.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  [{cp.id}] {cp.name} ({cp.agency})
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Vehicle Type:</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVehicleType('cars')}
                className={`flex-1 py-1.5 px-3 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  vehicleType === 'cars'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Car</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('motorcycles')}
                className={`flex-1 py-1.5 px-3 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  vehicleType === 'motorcycles'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Motorcycle</span>
              </button>
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Entry Time:</label>
              <input
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Exit Time:</label>
              <input
                type="time"
                value={exitTime}
                onChange={(e) => setExitTime(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          {/* Sunday / Public Holiday Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-slate-800">Sunday or Public Holiday?</span>
            </div>
            <input
              type="checkbox"
              checked={isSunday}
              onChange={(e) => setIsSunday(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Calculation Output Card */}
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-inner">
            <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
              <span>Duration:</span>
              <span className="font-mono font-medium">
                {durationHours} hr {remainderMins} mins ({durationMins}m total)
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-800">
              <span className="text-sm font-semibold text-slate-200">Estimated Total:</span>
              <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                ${estimatedFee.toFixed(2)} SGD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 italic">{feeBreakdownNote}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
