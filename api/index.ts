/**
 * LTA DataMall Serverless API Suite
 * 
 * Exports all endpoints for serverless platforms (Vercel, Netlify, Cloud Functions, Express).
 */

import healthHandler from './health';
import carparkAvailabilityHandler from './carparkavailability';
import busArrivalHandler from './busarrival';
import trafficIncidentsHandler from './trafficincidents';
import trainAlertsHandler from './trainalerts';

export {
  healthHandler,
  carparkAvailabilityHandler,
  busArrivalHandler,
  trafficIncidentsHandler,
  trainAlertsHandler,
};

export * from './ltaClient';

/**
 * Optional Express router helper for mounting under app.use('/api', createApiRouter())
 */
export function createApiRouter() {
  try {
    const express = require('express');
    const router = express.Router();

    router.all('/health', healthHandler);
    router.all('/carparkavailability', carparkAvailabilityHandler);
    router.all('/busarrival', busArrivalHandler);
    router.all('/trafficincidents', trafficIncidentsHandler);
    router.all('/trainalerts', trainAlertsHandler);

    return router;
  } catch {
    return null;
  }
}
