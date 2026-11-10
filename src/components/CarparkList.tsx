import React, { useState } from 'react';
import { Carpark, VehicleType, FilterState } from '../types/carpark';
import { CarparkCard } from './CarparkCard';
import {
  ArrowUpDown,
  LayoutGrid,
  List,
  SearchX,
  ExternalLink,
  Zap,
  Sparkles,
} from 'lucide-react';

interface CarparkListProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  onOpenDetails: (carpark: Carpark) => void;
  selectedVehicleType: VehicleType;
  filterState: FilterState;
  onUpdateFilter: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (carparkId: string) => void;
}

export const CarparkList: React.FC<CarparkListProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  onOpenDetails,
  selectedVehicleType,
  filterState,
  onUpdateFilter,
  onResetFilters,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Compute aggregate statistics for current filtered carparks
  const totalLots = carparks.reduce((acc, cp) => {
    const info =
      selectedVehicleType === 'cars'
        ? cp.lots.cars
        : selectedVehicleType === 'motorcycles'
        ? cp.lots.motorcycles || cp.lots.cars
        : cp.lots.heavyVehicles || cp.lots.cars;
    return acc + info.total;
  }, 0);

  const totalAvailable = carparks.reduce((acc, cp) => {
    const info =
      selectedVehicleType === 'cars'
        ? cp.lots.cars
        : selectedVehicleType === 'motorcycles'
        ? cp.lots.motorcycles || cp.lots.cars
        : cp.lots.heavyVehicles || cp.lots.cars;
    return acc + info.available;
  }, 0);

  const evCount = carparks.filter((c) => c.hasEVCharging).length;
  const fpsCount = carparks.filter((c) => c.hasFreeParkingScheme).length;

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Metrics Row */}
      <div className="px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500">Available: </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {totalAvailable.toLocaleString()}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {' '}/ {totalLots.toLocaleString()} lots
              </span>
            </div>
            <div className="hidden sm:block text-slate-300">|</div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-600">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>{evCount} EV ready</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{fpsCount} Free Sun</span>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card view"
              aria-label="Card view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            Showing {carparks.length} locations
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={filterState.sortBy}
              onChange={(e) =>
                onUpdateFilter({
                  sortBy: e.target.value as FilterState['sortBy'],
                })
              }
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-blue-500"
            >
              <option value="available">Most Available Lots</option>
              <option value="percentage">Highest Availability %</option>
              <option value="distance">Nearest Distance</option>
              <option value="name">Carpark Name (A-Z)</option>
            </select>
            <button
              type="button"
              onClick={() =>
                onUpdateFilter({
                  sortOrder: filterState.sortOrder === 'asc' ? 'desc' : 'asc',
                })
              }
              className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-700 hover:bg-slate-50"
              title="Toggle sort direction"
            >
              {filterState.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {carparks.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-dashed border-slate-300">
            <SearchX className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="font-semibold text-slate-900 text-sm">No carparks found</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
              We couldn't find any carparks matching your active filters or search keyword.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="space-y-3">
            {carparks.map((carpark) => (
              <CarparkCard
                key={carpark.id}
                carpark={carpark}
                isSelected={selectedCarpark?.id === carpark.id}
                onSelect={onSelectCarpark}
                onOpenDetails={onOpenDetails}
                selectedVehicleType={selectedVehicleType}
                isBookmarked={bookmarkedIds.has(carpark.id)}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        ) : (
          /* High-Density Data Table View */
          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Carpark</th>
                  <th className="py-2.5 px-3">Agency</th>
                  <th className="py-2.5 px-3 text-right">Available Lots</th>
                  <th className="py-2.5 px-3 text-right">Occupancy</th>
                  <th className="py-2.5 px-3">Clearance</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {carparks.map((carpark) => {
                  const info =
                    selectedVehicleType === 'cars'
                      ? carpark.lots.cars
                      : selectedVehicleType === 'motorcycles'
                      ? carpark.lots.motorcycles || carpark.lots.cars
                      : carpark.lots.heavyVehicles || carpark.lots.cars;
                  const pct = info.total > 0 ? Math.round((info.available / info.total) * 100) : 0;
                  const isSel = selectedCarpark?.id === carpark.id;

                  return (
                    <tr
                      key={carpark.id}
                      onClick={() => onSelectCarpark(carpark)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        isSel ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                          {carpark.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {carpark.id} · {carpark.area}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {carpark.agency}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {info.available}
                        <span className="text-slate-400 font-normal text-[11px]"> / {info.total}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <span
                          className={`font-semibold ${
                            info.available === 0
                              ? 'text-slate-500'
                              : info.available < 15
                              ? 'text-rose-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {carpark.heightLimit ? `${carpark.heightLimit}m` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetails(carpark);
                          }}
                          className="px-2 py-1 text-slate-600 hover:text-blue-600 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
