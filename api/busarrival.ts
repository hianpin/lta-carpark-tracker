/**
 * Serverless Bus Arrival Endpoint: /api/busarrival
 * 
 * Proxies live bus arrival data (v3 - 20-second refresh) from:
 * https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139&ServiceNo=15
 * 
 * Query Parameters:
 * - BusStopCode: 5-digit bus stop code (default: '83139')
 * - ServiceNo: optional bus route number (e.g. '15')
 * 
 * Header: AccountKey: <Your_LTA_Key>
 */

import { fetchLtaDataMall, sendJson, setCorsHeaders, getLtaAccountKey } from './ltaClient';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { status: 'ok' });
  }

  const url = new URL(req.url || '', 'http://localhost');
  const busStopCode =
    req.query?.BusStopCode ||
    req.query?.busStopCode ||
    url.searchParams.get('BusStopCode') ||
    url.searchParams.get('busStopCode') ||
    '83139';

  const serviceNo =
    req.query?.ServiceNo ||
    req.query?.serviceNo ||
    url.searchParams.get('ServiceNo') ||
    url.searchParams.get('serviceNo');

  const accountKey = getLtaAccountKey(req);
  if (!accountKey) {
    return sendJson(res, 401, {
      status: 'unauthorized',
      error: 'Missing LTA AccountKey.',
      instructions:
        'Set LTA_ACCOUNT_KEY or LTA_DATAMALL_API_KEY in your environment variables, or pass header x-account-key.',
      targetEndpoint: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival',
    });
  }

  try {
    const params: Record<string, string> = {
      BusStopCode: busStopCode,
    };
    if (serviceNo) {
      params.ServiceNo = serviceNo;
    }

    const data = await fetchLtaDataMall({
      endpoint: 'v3/BusArrival',
      params,
      req,
    });

    return sendJson(res, 200, {
      status: 'success',
      source: 'LTA DataMall v3/BusArrival',
      busStopCode,
      serviceNo: serviceNo || 'all',
      timestamp: new Date().toISOString(),
      services: data.Services || [],
      raw: data,
    });
  } catch (error: any) {
    console.error('Error fetching LTA bus arrivals:', error);
    return sendJson(res, error.statusCode || 500, {
      status: 'error',
      error: error.message || 'Failed to retrieve bus arrivals from LTA DataMall',
      statusCode: error.statusCode || 500,
    });
  }
}
