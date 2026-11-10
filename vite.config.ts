import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import healthHandler from './api/health';
import carparkAvailabilityHandler from './api/carparkavailability';
import busArrivalHandler from './api/busarrival';
import trafficIncidentsHandler from './api/trafficincidents';
import trainAlertsHandler from './api/trainalerts';

function ltaServerlessPlugin(): Plugin {
  return {
    name: 'lta-serverless-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const urlPath = req.url.split('?')[0];

        try {
          if (urlPath === '/api/health') {
            await healthHandler(req, res);
            return;
          }
          if (urlPath === '/api/carparkavailability') {
            await carparkAvailabilityHandler(req, res);
            return;
          }
          if (urlPath === '/api/busarrival') {
            await busArrivalHandler(req, res);
            return;
          }
          if (urlPath === '/api/trafficincidents') {
            await trafficIncidentsHandler(req, res);
            return;
          }
          if (urlPath === '/api/trainalerts') {
            await trainAlertsHandler(req, res);
            return;
          }
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Server error' }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), ltaServerlessPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
