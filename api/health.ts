/**
 * Serverless Healthcheck Endpoint: /api/health
 * 
 * Reports serverless runtime status, endpoints catalog, and whether
 * LTA DataMall AccountKey is configured (without disclosing key values).
 */

import { getLtaAccountKey, sendJson, setCorsHeaders } from './ltaClient';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { status: 'ok' });
  }

  const accountKey = getLtaAccountKey(req);
  const isKeyConfigured = Boolean(accountKey && accountKey.length > 5);

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    ltaKeyConfigured: isKeyConfigured,
    endpoints: {
      health: '/api/health',
      carparkAvailability: '/api/carparkavailability',
      busArrival: '/api/busarrival?BusStopCode=83139&ServiceNo=15',
      trafficIncidents: '/api/trafficincidents',
      trainAlerts: '/api/trainalerts',
    },
    message: isKeyConfigured
      ? 'LTA AccountKey is loaded from environment. Ready to proxy requests.'
      : 'Serverless functions are running. LTA_ACCOUNT_KEY is pending configuration.',
  };

  return sendJson(res, 200, healthData);
}
