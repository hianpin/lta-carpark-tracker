/**
 * Serverless Traffic Incidents Endpoint: /api/trafficincidents
 * 
 * Proxies live traffic accidents, road closures, and heavy traffic incidents from:
 * https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents
 * 
 * Header: AccountKey: <Your_LTA_Key>
 */

import { fetchLtaDataMall, sendJson, setCorsHeaders, getLtaAccountKey } from './ltaClient';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { status: 'ok' });
  }

  const accountKey = getLtaAccountKey(req);
  if (!accountKey) {
    return sendJson(res, 401, {
      status: 'unauthorized',
      error: 'Missing LTA AccountKey.',
      instructions:
        'Set LTA_ACCOUNT_KEY or LTA_DATAMALL_API_KEY in your environment variables, or pass header x-account-key.',
      targetEndpoint: 'https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents',
    });
  }

  try {
    const data = await fetchLtaDataMall({
      endpoint: 'TrafficIncidents',
      req,
    });

    return sendJson(res, 200, {
      status: 'success',
      source: 'LTA DataMall TrafficIncidents',
      timestamp: new Date().toISOString(),
      incidentsCount: data.value?.length || 0,
      value: data.value || [],
    });
  } catch (error: any) {
    console.error('Error fetching LTA traffic incidents:', error);
    return sendJson(res, error.statusCode || 500, {
      status: 'error',
      error: error.message || 'Failed to retrieve traffic incidents from LTA DataMall',
      statusCode: error.statusCode || 500,
    });
  }
}
