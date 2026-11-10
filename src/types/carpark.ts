export type AgencyType = 'HDB' | 'URA' | 'Commercial';
export type CarparkType = 'Multi-Storey' | 'Basement' | 'Surface' | 'Covered' | 'Mechanized';
export type VehicleType = 'cars' | 'motorcycles' | 'heavyVehicles';

export interface LotInfo {
  available: number;
  total: number;
}

export interface CarparkRates {
  weekdayPeak: string;
  weekdayOffpeak: string;
  nightCap?: string;
  weekendSunday?: string;
  gracePeriodMins: number;
  perHalfHourCents?: number;
}

export interface Carpark {
  id: string; // e.g. TP24, ACB, ORC01
  name: string;
  address: string;
  area: string; // e.g. Orchard, Tampines, Jurong East, CBD, Bugis
  agency: AgencyType;
  carparkType: CarparkType;
  coordinates: {
    lat: number;
    lng: number;
  };
  lots: {
    cars: LotInfo;
    motorcycles?: LotInfo;
    heavyVehicles?: LotInfo;
  };
  heightLimit?: number; // in meters, e.g. 2.0, 2.15, 4.5
  parkingSystem: 'Electronic Parking System (EPS)' | 'Coupon' | 'Automated Barrierless';
  rates: CarparkRates;
  hasFreeParkingScheme: boolean;
  hasEVCharging: boolean;
  evChargerCount?: number;
  evChargerOperator?: string;
  lastUpdated: string;
  historyTrend: number[]; // e.g. 6 data points showing available lots over past 2 hours
  distanceKm?: number;
}

export type AvailabilityStatus = 'ample' | 'moderate' | 'scarce' | 'full';

export interface ConnectorConfig {
  sourceType: 'simulated' | 'datagov' | 'custom';
  customUrl: string;
  autoRefreshInterval: number; // in seconds (0 = off, 15, 30, 60)
  lastSyncTimestamp: string | null;
  status: 'connected' | 'syncing' | 'error' | 'idle';
  errorMessage?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedArea: string;
  selectedAgency: 'All' | AgencyType;
  selectedVehicleType: VehicleType;
  minAvailableLots: number;
  onlyFreeParking: boolean;
  onlyEVCharging: boolean;
  minHeightClearance: number; // 0 means no filter
  sortBy: 'distance' | 'available' | 'percentage' | 'name';
  sortOrder: 'asc' | 'desc';
}
