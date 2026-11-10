/**
 * Serverless MRT/LRT Alerts Endpoint: /api/trainalerts
 * 
 * Proxies live train service disruption and operational status alerts from:
 * https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts
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
      targetEndpoint: 'https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts',
    });
  }

  try {
    const data = await fetchLtaDataMall({
      endpoint: 'TrainServiceAlerts',
      req,
    });

    const statusValue = data.value?.Status;
    const isNormal = statusValue === 1;

    return sendJson(res, 200, {
      status: 'success',
      source: 'LTA DataMall TrainServiceAlerts',
      timestamp: new Date().toISOString(),
      trainServiceStatus: isNormal ? 'Normal' : 'Disrupted / Alert',
      affectedSegments: data.value?.AffectedSegments || [],
      raw: data.value,
    });
  } catch (error: any) {
    console.error('Error fetching LTA train alerts:', error);
    return sendJson(res, error.statusCode || 500, {
      status: 'error',
      error: error.message || 'Failed to retrieve train service alerts from LTA DataMall',
      statusCode: error.statusCode || 500,
    });
  }
}
