/**
 * LTA DataMall Serverless Helper & Client
 * 
 * Handles LTA DataMall API requests with proper AccountKey authorization headers,
 * CORS headers, and error handling for serverless environments.
 */

export const LTA_BASE_URL = 'https://datamall2.mytransport.sg/ltaodataservice';

export interface LtaFetchOptions {
  endpoint: string;
  params?: Record<string, string | number | undefined>;
  req?: any;
}

/**
 * Resolves the LTA AccountKey from environment variables or incoming request headers
 */
export function getLtaAccountKey(req?: any): string | null {
  // 1. Environment variables
  const envKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_API_KEY ||
    process.env.ACCOUNT_KEY;

  if (envKey && envKey.trim().length > 0 && envKey !== 'YOUR_LTA_DATAMALL_ACCOUNT_KEY') {
    return envKey.trim();
  }

  // 2. Fallback to request header (e.g. x-account-key or accountkey) for testing
  if (req && req.headers) {
    const headerKey =
      req.headers['x-account-key'] ||
      req.headers['accountkey'] ||
      req.headers['AccountKey'];
    if (typeof headerKey === 'string' && headerKey.trim().length > 0) {
      return headerKey.trim();
    }
  }

  return null;
}

/**
 * Sets standard CORS headers on the response object
 */
export function setCorsHeaders(res: any) {
  if (!res || !res.setHeader) return;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, x-account-key, Authorization');
}

/**
 * Fetch data from LTA DataMall endpoint with AccountKey
 */
export async function fetchLtaDataMall(options: LtaFetchOptions): Promise<any> {
  const { endpoint, params = {}, req } = options;
  const accountKey = getLtaAccountKey(req);

  if (!accountKey) {
    const error: any = new Error(
      'Missing LTA AccountKey. Set LTA_ACCOUNT_KEY or LTA_DATAMALL_API_KEY in your environment variables, or pass header x-account-key.'
    );
    error.statusCode = 401;
    error.isKeyMissing = true;
    throw error;
  }

  // Build query string
  const url = new URL(
    endpoint.startsWith('http') ? endpoint : `${LTA_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  );

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      AccountKey: accountKey,
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    const error: any = new Error(
      `LTA DataMall API responded with status ${response.status}: ${response.statusText} - ${errText}`
    );
    error.statusCode = response.status;
    error.responseBody = errText;
    throw error;
  }

  return response.json();
}

/**
 * Helper to handle standard HTTP serverless responses (Node / Vercel / Express)
 */
export function sendJson(res: any, statusCode: number, data: any) {
  setCorsHeaders(res);
  if (res.status && typeof res.status === 'function') {
    return res.status(statusCode).json(data);
  }
  if (res.writeHead && res.end) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    return res.end(JSON.stringify(data));
  }
}
