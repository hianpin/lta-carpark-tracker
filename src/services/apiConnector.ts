import { Carpark, ConnectorConfig } from '../types/carpark';

export interface DataGovCarparkInfo {
  total_lots: string;
  lot_type: 'C' | 'H' | 'Y'; // Car, Heavy, Motorcycle
  lots_available: string;
}

export interface DataGovCarparkItem {
  carpark_number: string;
  update_datetime: string;
  carpark_info: DataGovCarparkInfo[];
}

export interface DataGovResponse {
  items: Array<{
    timestamp: string;
    carpark_data: DataGovCarparkItem[];
  }>;
}

// Service to fetch real data from data.gov.sg or custom backend
export async function fetchDataGovCarparks(): Promise<Map<string, { available: number; total: number }>> {
  const url = 'https://api.data.gov.sg/v1/transport/carpark-availability';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Data.gov.sg API returned status ${response.status}`);
  }
  const data: DataGovResponse = await response.json();
  const resultMap = new Map<string, { available: number; total: number }>();

  if (data.items && data.items.length > 0 && data.items[0].carpark_data) {
    for (const item of data.items[0].carpark_data) {
      const carInfo = item.carpark_info.find((i) => i.lot_type === 'C') || item.carpark_info[0];
      if (carInfo) {
        resultMap.set(item.carpark_number.toUpperCase(), {
          available: parseInt(carInfo.lots_available, 10) || 0,
          total: parseInt(carInfo.total_lots, 10) || 0,
        });
      }
    }
  }

  return resultMap;
}

export async function fetchCustomBackendCarparks(url: string): Promise<Carpark[]> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `Serverless endpoint returned status ${response.status}: ${response.statusText}`
    );
  }
  const data = await response.json();
  if (Array.isArray(data)) {
    return data as Carpark[];
  }
  if (data && Array.isArray(data.carparks)) {
    return data.carparks as Carpark[];
  }
  if (data && Array.isArray(data.value)) {
    // Convert LTA DataMall CarParkAvailabilityv2 records to Carpark items
    return data.value.map((rec: any, idx: number) => {
      const coords = rec.Location?.split(' ') || ['1.3521', '103.8198'];
      const lat = parseFloat(coords[0]) || 1.3521;
      const lng = parseFloat(coords[1]) || 103.8198;
      const available = typeof rec.AvailableLots === 'number' ? rec.AvailableLots : parseInt(rec.AvailableLots, 10) || 0;
      const total = Math.max(available, 100);

      return {
        id: rec.CarParkID || `LTA-${idx}`,
        name: rec.Development || `Carpark ${rec.CarParkID}`,
        address: rec.Area ? `${rec.Area}, Singapore` : 'Singapore',
        area: rec.Area || 'Central',
        agency: rec.Agency || 'LTA',
        carparkType: 'Multi-Storey',
        coordinates: { lat, lng },
        lots: {
          cars: { available, total },
        },
        parkingSystem: 'Electronic Parking System (EPS)',
        rates: {
          weekdayPeak: '$1.20 / 30 mins',
          weekdayOffpeak: '$0.60 / 30 mins',
          gracePeriodMins: 10,
          perHalfHourCents: 120,
        },
        hasFreeParkingScheme: rec.Agency === 'HDB',
        hasEVCharging: false,
        lastUpdated: 'Just now (LTA DataMall)',
        historyTrend: [available, available, available, available, available, available],
      } as Carpark;
    });
  }
  throw new Error('Unrecognized response format: expected an array of carparks, { carparks: [...] }, or LTA { value: [...] }');
}

// Distance calculation using Haversine formula
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Helper code snippet template for user's future backend integration
export const BACKEND_SAMPLE_EXPRESS_CODE = `/**
 * Sample Express / Node.js Backend Connector for Singapore Carpark Tracker
 * 
 * Sources:
 * 1. LTA DataMall (CarParkAvailabilityv2) - Requires AccountKey header
 * 2. Data.gov.sg (Carpark Availability API) - Free, no auth required
 */

import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;
const LTA_API_KEY = process.env.LTA_DATAMALL_API_KEY;

// Endpoint: Fetch Real-Time Carpark Availability
app.get('/api/carparks/realtime', async (req, res) => {
  try {
    // Option A: LTA DataMall API v2
    if (LTA_API_KEY) {
      const response = await fetch(
        'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
        {
          headers: {
            'AccountKey': LTA_API_KEY,
            'accept': 'application/json'
          }
        }
      );
      const data = await response.json();
      return res.json({
        source: 'LTA DataMall',
        timestamp: new Date().toISOString(),
        totalRecords: data.value?.length || 0,
        value: data.value
      });
    }

    // Option B: Data.gov.sg Open Transport API
    const response = await fetch(
      'https://api.data.gov.sg/v1/transport/carpark-availability'
    );
    const data = await response.json();
    return res.json({
      source: 'data.gov.sg',
      timestamp: data.items?.[0]?.timestamp,
      carparks: data.items?.[0]?.carpark_data || []
    });

  } catch (err) {
    console.error('Error fetching carparks:', err);
    res.status(500).json({ error: 'Failed to retrieve carpark availability' });
  }
});

app.listen(PORT, () => {
  console.log(\`ParkSG Backend listening on port \${PORT}\`);
});
`;
