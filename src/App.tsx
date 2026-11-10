/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Carpark,
  FilterState,
  ConnectorConfig,
  VehicleType,
} from './types/carpark';
import {
  INITIAL_CARPARKS,
  PRESET_MAP_LOCATIONS,
} from './data/singaporeCarparks';
import {
  fetchDataGovCarparks,
  fetchCustomBackendCarparks,
  calculateDistanceKm,
} from './services/apiConnector';
import { Header } from './components/Header';
import { FiltersBar } from './components/FiltersBar';
import { CarparkMap } from './components/CarparkMap';
import { CarparkList } from './components/CarparkList';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { FeeCalculatorModal } from './components/FeeCalculatorModal';
import { BackendConnectorModal } from './components/BackendConnectorModal';
import {
  MapPin,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_CARPARKS);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [activeDetailCarpark, setActiveDetailCarpark] = useState<Carpark | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isConnectorOpen, setIsConnectorOpen] = useState<boolean>(false);
  const [activeLayout, setActiveLayout] = useState<'split' | 'map' | 'list'>('split');
  const [showOnlySaved, setShowOnlySaved] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [centerCoordinates, setCenterCoordinates] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isTestingConnector, setIsTestingConnector] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Persistent Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('parksg_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set(['ORC01', 'TP24', 'CBD01']);
    } catch {
      return new Set(['ORC01', 'TP24', 'CBD01']);
    }
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('parksg_bookmarks', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Connector Config State
  const [connectorConfig, setConnectorConfig] = useState<ConnectorConfig>(() => {
    try {
      const saved = localStorage.getItem('parksg_connector_config');
      return saved
        ? JSON.parse(saved)
        : {
            sourceType: 'simulated',
            customUrl: 'http://localhost:3000/api/carparks/realtime',
            autoRefreshInterval: 30,
            lastSyncTimestamp: 'Just now',
            status: 'connected',
          };
    } catch {
      return {
        sourceType: 'simulated',
        customUrl: 'http://localhost:3000/api/carparks/realtime',
        autoRefreshInterval: 30,
        lastSyncTimestamp: 'Just now',
        status: 'connected',
      };
    }
  });

  const updateConnectorConfig = (updates: Partial<ConnectorConfig>) => {
    setConnectorConfig((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('parksg_connector_config', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedArea: 'All Areas',
    selectedAgency: 'All',
    selectedVehicleType: 'cars',
    minAvailableLots: 0,
    onlyFreeParking: false,
    onlyEVCharging: false,
    minHeightClearance: 0,
    sortBy: 'available',
    sortOrder: 'desc',
  });

  const updateFilter = (updates: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilterState({
      searchQuery: '',
      selectedArea: 'All Areas',
      selectedAgency: 'All',
      selectedVehicleType: 'cars',
      minAvailableLots: 0,
      onlyFreeParking: false,
      onlyEVCharging: false,
      minHeightClearance: 0,
      sortBy: 'available',
      sortOrder: 'desc',
    });
    setShowOnlySaved(false);
  };

  // Geolocation Handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setCenterCoordinates({ ...coords, zoom: 15 });
        setIsLocating(false);

        // Update carpark distance relative to user
        setCarparks((prev) =>
          prev.map((c) => ({
            ...c,
            distanceKm: calculateDistanceKm(coords.lat, coords.lng, c.coordinates.lat, c.coordinates.lng),
          }))
        );
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        // Default to Central Singapore
        const defaultCoords = { lat: 1.3038, lng: 103.8335 };
        setCenterCoordinates({ ...defaultCoords, zoom: 14 });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Sync / Refresh Real-Time Lots
  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (connectorConfig.sourceType === 'datagov') {
        const liveMap = await fetchDataGovCarparks();
        setCarparks((prev) =>
          prev.map((cp) => {
            const liveMatch = liveMap.get(cp.id.toUpperCase());
            if (liveMatch && liveMatch.total > 0) {
              const prevAvail = cp.lots.cars.available;
              return {
                ...cp,
                lots: {
                  ...cp.lots,
                  cars: {
                    available: liveMatch.available,
                    total: liveMatch.total,
                  },
                },
                lastUpdated: 'Just now (data.gov.sg)',
                historyTrend: [...cp.historyTrend.slice(1), liveMatch.available],
              };
            }
            return cp;
          })
        );
      } else if (connectorConfig.sourceType === 'custom' && connectorConfig.customUrl) {
        const customData = await fetchCustomBackendCarparks(connectorConfig.customUrl);
        setCarparks(customData);
      } else {
        // Natural simulation variance
        setCarparks((prev) =>
          prev.map((cp) => {
            // Delta between -4 and +4 lots
            const delta = Math.floor(Math.random() * 9) - 4;
            const newAvail = Math.max(0, Math.min(cp.lots.cars.total, cp.lots.cars.available + delta));
            return {
              ...cp,
              lots: {
                ...cp.lots,
                cars: {
                  ...cp.lots.cars,
                  available: newAvail,
                },
              },
              lastUpdated: 'Just now (simulated)',
              historyTrend: [...cp.historyTrend.slice(1), newAvail],
            };
          })
        );
      }
      updateConnectorConfig({
        lastSyncTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err) {
      console.error('Error refreshing carpark data:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  }, [connectorConfig.sourceType, connectorConfig.customUrl]);

  // Test Connection helper inside modal
  const handleTestConnection = async () => {
    setIsTestingConnector(true);
    setTestResult(null);
    try {
      if (connectorConfig.sourceType === 'datagov') {
        const result = await fetchDataGovCarparks();
        setTestResult({
          success: true,
          message: `Successfully connected to data.gov.sg! Received real-time lot records for ${result.size} Singapore carparks.`,
        });
      } else if (connectorConfig.sourceType === 'custom') {
        const result = await fetchCustomBackendCarparks(connectorConfig.customUrl);
        setTestResult({
          success: true,
          message: `Successfully reached custom backend! Retrieved ${result.length} valid carparks.`,
        });
      } else {
        setTestResult({
          success: true,
          message: 'Simulated live feed is active and providing realistic Singapore occupancy data.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect. Please check network and CORS headers.',
      });
    } finally {
      setIsTestingConnector(false);
    }
  };

  // Auto-Refresh Polling interval
  useEffect(() => {
    if (connectorConfig.autoRefreshInterval <= 0) return;
    const intervalId = setInterval(() => {
      handleRefreshData();
    }, connectorConfig.autoRefreshInterval * 1000);
    return () => clearInterval(intervalId);
  }, [connectorConfig.autoRefreshInterval, handleRefreshData]);

  // Filtered & Sorted carparks
  const filteredCarparks = useMemo(() => {
    return carparks
      .filter((carpark) => {
        // Bookmarks filter
        if (showOnlySaved && !bookmarkedIds.has(carpark.id)) return false;

        // Search Query
        if (filterState.searchQuery.trim()) {
          const query = filterState.searchQuery.toLowerCase().trim();
          const matchId = carpark.id.toLowerCase().includes(query);
          const matchName = carpark.name.toLowerCase().includes(query);
          const matchAddress = carpark.address.toLowerCase().includes(query);
          const matchArea = carpark.area.toLowerCase().includes(query);
          if (!matchId && !matchName && !matchAddress && !matchArea) return false;
        }

        // Area Filter
        if (filterState.selectedArea !== 'All Areas' && carpark.area !== filterState.selectedArea) {
          return false;
        }

        // Agency Filter
        if (filterState.selectedAgency !== 'All' && carpark.agency !== filterState.selectedAgency) {
          return false;
        }

        // EV Filter
        if (filterState.onlyEVCharging && !carpark.hasEVCharging) return false;

        // Free Parking Filter
        if (filterState.onlyFreeParking && !carpark.hasFreeParkingScheme) return false;

        return true;
      })
      .sort((a, b) => {
        const getLotCount = (cp: Carpark) => {
          if (filterState.selectedVehicleType === 'cars') return cp.lots.cars.available;
          if (filterState.selectedVehicleType === 'motorcycles')
            return cp.lots.motorcycles?.available || cp.lots.cars.available;
          return cp.lots.heavyVehicles?.available || cp.lots.cars.available;
        };

        const getPercentage = (cp: Carpark) => {
          const info =
            filterState.selectedVehicleType === 'cars'
              ? cp.lots.cars
              : filterState.selectedVehicleType === 'motorcycles'
              ? cp.lots.motorcycles || cp.lots.cars
              : cp.lots.heavyVehicles || cp.lots.cars;
          return info.total > 0 ? info.available / info.total : 0;
        };

        let diff = 0;
        if (filterState.sortBy === 'available') {
          diff = getLotCount(b) - getLotCount(a);
        } else if (filterState.sortBy === 'percentage') {
          diff = getPercentage(b) - getPercentage(a);
        } else if (filterState.sortBy === 'distance') {
          diff = (a.distanceKm || 999) - (b.distanceKm || 999);
        } else if (filterState.sortBy === 'name') {
          diff = a.name.localeCompare(b.name);
        }

        return filterState.sortOrder === 'asc' ? -diff : diff;
      });
  }, [carparks, filterState, showOnlySaved, bookmarkedIds]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Top Bar following contract */}
      <Header
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenConnector={() => setIsConnectorOpen(true)}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
        connectorConfig={connectorConfig}
        activeLayout={activeLayout}
        onSelectLayout={setActiveLayout}
      />

      {/* Global Filter Bar */}
      <FiltersBar
        filterState={filterState}
        onUpdateFilter={updateFilter}
        showOnlySaved={showOnlySaved}
        onToggleShowOnlySaved={() => setShowOnlySaved((prev) => !prev)}
        bookmarkedCount={bookmarkedIds.size}
        totalCarparksCount={carparks.length}
        onLocateUser={handleLocateUser}
        isLocating={isLocating}
      />

      {/* Preset Area Quick Selector Bar */}
      <div className="bg-white/80 border-b border-slate-200/60 px-4 py-2 overflow-x-auto flex items-center gap-2 text-xs shrink-0">
        <span className="text-slate-500 font-medium whitespace-nowrap text-[11px] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-400" />
          Jump to:
        </span>
        {PRESET_MAP_LOCATIONS.map((loc) => (
          <button
            key={loc.name}
            type="button"
            onClick={() => setCenterCoordinates({ lat: loc.lat, lng: loc.lng, zoom: loc.zoom })}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors text-[11px] font-medium"
          >
            {loc.name}
          </button>
        ))}
      </div>

      {/* Main Workspace Canvas */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Layout Mode: Split (Sidebar List + Map) */}
        {activeLayout === 'split' && (
          <>
            {/* Left Sidebar List */}
            <div className="w-full md:w-[460px] lg:w-[500px] shrink-0 h-full border-r border-slate-200 bg-white flex flex-col z-10 shadow-xs">
              <CarparkList
                carparks={filteredCarparks}
                selectedCarpark={selectedCarpark}
                onSelectCarpark={setSelectedCarpark}
                onOpenDetails={(cp) => setActiveDetailCarpark(cp)}
                selectedVehicleType={filterState.selectedVehicleType}
                filterState={filterState}
                onUpdateFilter={updateFilter}
                onResetFilters={resetFilters}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={toggleBookmark}
              />
            </div>

            {/* Right Map */}
            <div className="hidden md:block flex-1 h-full relative">
              <CarparkMap
                carparks={filteredCarparks}
                selectedCarpark={selectedCarpark}
                onSelectCarpark={setSelectedCarpark}
                selectedVehicleType={filterState.selectedVehicleType}
                userLocation={userLocation}
                centerCoordinates={centerCoordinates}
              />
            </div>
          </>
        )}

        {/* Layout Mode: Full Map */}
        {activeLayout === 'map' && (
          <div className="w-full h-full relative">
            <CarparkMap
              carparks={filteredCarparks}
              selectedCarpark={selectedCarpark}
              onSelectCarpark={setSelectedCarpark}
              selectedVehicleType={filterState.selectedVehicleType}
              userLocation={userLocation}
              centerCoordinates={centerCoordinates}
            />

            {/* Floating Selection Card on Map when carpark clicked */}
            {selectedCarpark && (
              <div className="absolute top-4 left-4 z-[400] max-w-sm w-full animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-slate-500 font-mono">
                        {selectedCarpark.id} · {selectedCarpark.agency}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedCarpark.name}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCarpark(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold font-mono text-slate-900">
                        {selectedCarpark.lots.cars.available}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {' '}/ {selectedCarpark.lots.cars.total} lots
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveDetailCarpark(selectedCarpark)}
                      className="px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Layout Mode: Full List Directory */}
        {activeLayout === 'list' && (
          <div className="w-full h-full max-w-5xl mx-auto p-4 md:p-6 overflow-y-auto">
            <CarparkList
              carparks={filteredCarparks}
              selectedCarpark={selectedCarpark}
              onSelectCarpark={(cp) => {
                setSelectedCarpark(cp);
                setActiveDetailCarpark(cp);
              }}
              onOpenDetails={(cp) => setActiveDetailCarpark(cp)}
              selectedVehicleType={filterState.selectedVehicleType}
              filterState={filterState}
              onUpdateFilter={updateFilter}
              onResetFilters={resetFilters}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
            />
          </div>
        )}
      </main>

      {/* Carpark Detail Drawer / Modal */}
      <CarparkDetailModal
        carpark={activeDetailCarpark}
        onClose={() => setActiveDetailCarpark(null)}
        isBookmarked={activeDetailCarpark ? bookmarkedIds.has(activeDetailCarpark.id) : false}
        onToggleBookmark={toggleBookmark}
        selectedVehicleType={filterState.selectedVehicleType}
      />

      {/* Parking Fee Calculator Modal */}
      <FeeCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        carparks={carparks}
        defaultCarparkId={selectedCarpark?.id}
      />

      {/* Backend Connector & Developer Architecture Modal */}
      <BackendConnectorModal
        isOpen={isConnectorOpen}
        onClose={() => setIsConnectorOpen(false)}
        config={connectorConfig}
        onUpdateConfig={updateConnectorConfig}
        onTestConnection={handleTestConnection}
        isTesting={isTestingConnector}
        testResult={testResult}
      />
    </div>
  );
}
