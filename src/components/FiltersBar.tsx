import React from 'react';
import { FilterState, VehicleType, AgencyType } from '../types/carpark';
import { SINGAPORE_AREAS } from '../data/singaporeCarparks';
import {
  Search,
  X,
  Car,
  Bike,
  Truck,
  Zap,
  Sparkles,
  Bookmark,
  SlidersHorizontal,
  MapPin,
} from 'lucide-react';

interface FiltersBarProps {
  filterState: FilterState;
  onUpdateFilter: (updates: Partial<FilterState>) => void;
  showOnlySaved: boolean;
  onToggleShowOnlySaved: () => void;
  bookmarkedCount: number;
  totalCarparksCount: number;
  onLocateUser: () => void;
  isLocating: boolean;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filterState,
  onUpdateFilter,
  showOnlySaved,
  onToggleShowOnlySaved,
  bookmarkedCount,
  totalCarparksCount,
  onLocateUser,
  isLocating,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
      {/* Primary Search & Quick Location Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) => onUpdateFilter({ searchQuery: e.target.value })}
            placeholder="Search by carpark code (e.g. TP24, ACB), mall name, or street..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 transition-colors"
          />
          {filterState.searchQuery && (
            <button
              type="button"
              onClick={() => onUpdateFilter({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Area Dropdown */}
        <div className="w-full md:w-52 shrink-0">
          <select
            value={filterState.selectedArea}
            onChange={(e) => onUpdateFilter({ selectedArea: e.target.value })}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 font-medium focus:outline-hidden focus:bg-white focus:border-blue-500"
          >
            {SINGAPORE_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Locate Me Button */}
        <button
          type="button"
          onClick={onLocateUser}
          disabled={isLocating}
          className="shrink-0 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          title="Find carparks near your current GPS location"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
        </button>

        {/* Bookmarks Toggle Tab */}
        <button
          type="button"
          onClick={onToggleShowOnlySaved}
          className={`shrink-0 px-3 py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
            showOnlySaved
              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${showOnlySaved ? 'fill-white' : 'text-amber-500'}`} />
          <span>Saved ({bookmarkedCount})</span>
        </button>
      </div>

      {/* Secondary Controls: Vehicle Type, Agency, Feature Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-slate-100 text-xs">
        {/* Vehicle Type Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onUpdateFilter({ selectedVehicleType: 'cars' })}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              filterState.selectedVehicleType === 'cars'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Cars</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdateFilter({ selectedVehicleType: 'motorcycles' })}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              filterState.selectedVehicleType === 'motorcycles'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Motorcycles</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdateFilter({ selectedVehicleType: 'heavyVehicles' })}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              filterState.selectedVehicleType === 'heavyVehicles'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Heavy</span>
          </button>
        </div>

        {/* Agency Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['All', 'HDB', 'URA', 'Commercial'] as const).map((agency) => (
            <button
              key={agency}
              type="button"
              onClick={() => onUpdateFilter({ selectedAgency: agency })}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterState.selectedAgency === agency
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {agency}
            </button>
          ))}
        </div>

        {/* Feature Switches */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              onUpdateFilter({ onlyEVCharging: !filterState.onlyEVCharging })
            }
            className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors ${
              filterState.onlyEVCharging
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>EV Chargers</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateFilter({ onlyFreeParking: !filterState.onlyFreeParking })
            }
            className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors ${
              filterState.onlyFreeParking
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Sunday Free Scheme</span>
          </button>
        </div>
      </div>
    </div>
  );
};
