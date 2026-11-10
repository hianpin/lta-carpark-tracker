/**
 * Serverless Carpark Availability Endpoint: /api/carparkavailability
 * 
 * Proxies live carpark lots across Singapore (HDB + LTA + URA) from:
 * https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 * 
 * Header: AccountKey: <Your_LTA_Key>
 */

import { fetchLtaDataMall, sendJson, setCorsHeaders, getLtaAccountKey } from './ltaClient';

export interface LtaCarparkRecord {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // e.g. "1.293 103.857" (lat lng)
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y'; // C = Car, H = Heavy, Y = Motorcycle
  Agency: 'HDB' | 'URA' | 'LTA';
}

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { status: 'ok' });
  }

  // Parse query params safely whether from URL string or parsed query object
  const url = new URL(req.url || '', 'http://localhost');
  const skip = req.query?.skip || req.query?.$skip || url.searchParams.get('skip') || url.searchParams.get('$skip');
  const fetchAll = req.query?.fetchAll || url.searchParams.get('fetchAll');

  const accountKey = getLtaAccountKey(req);
  if (!accountKey) {
    return sendJson(res, 401, {
      status: 'unauthorized',
      error: 'Missing LTA AccountKey.',
      instructions:
        'Set LTA_ACCOUNT_KEY or LTA_DATAMALL_API_KEY in your environment variables, or pass header x-account-key.',
      targetEndpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      hint: 'No keys are hardcoded in the codebase as requested. Keys can be injected via .env or server secrets.',
    });
  }

  try {
    // If client specifically asks for a single page with skip
    if (skip !== null && skip !== undefined) {
      const data = await fetchLtaDataMall({
        endpoint: 'CarParkAvailabilityv2',
        params: { $skip: skip },
        req,
      });

      return sendJson(res, 200, {
        status: 'success',
        source: 'LTA DataMall CarParkAvailabilityv2',
        timestamp: new Date().toISOString(),
        count: data.value?.length || 0,
        value: data.value || [],
      });
    }

    // Default: fetch the first page, or fetch multiple pages if fetchAll=true
    const firstPage = await fetchLtaDataMall({
      endpoint: 'CarParkAvailabilityv2',
      req,
    });

    let records: LtaCarparkRecord[] = firstPage.value || [];

    // If fetchAll is requested, paginate until no more records are returned
    if (fetchAll === 'true' && records.length === 500) {
      let currentSkip = 500;
      let hasMore = true;

      while (hasMore && currentSkip < 3000) {
        try {
          const nextPage = await fetchLtaDataMall({
            endpoint: 'CarParkAvailabilityv2',
            params: { $skip: currentSkip },
            req,
          });

          const nextBatch = nextPage.value || [];
          if (nextBatch.length === 0) {
            hasMore = false;
          } else {
            records = records.concat(nextBatch);
            currentSkip += 500;
            if (nextBatch.length < 500) hasMore = false;
          }
        } catch (pageErr) {
          // If pagination hits limits, return what we have so far
          hasMore = false;
        }
      }
    }

    return sendJson(res, 200, {
      status: 'success',
      source: 'LTA DataMall CarParkAvailabilityv2',
      timestamp: new Date().toISOString(),
      totalRecords: records.length,
      value: records,
    });
  } catch (error: any) {
    console.error('Error fetching LTA carpark availability:', error);
    return sendJson(res, error.statusCode || 500, {
      status: 'error',
      error: error.message || 'Failed to retrieve carpark availability from LTA DataMall',
      statusCode: error.statusCode || 500,
    });
  }
}
