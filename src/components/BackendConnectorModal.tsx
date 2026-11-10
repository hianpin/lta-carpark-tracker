import React, { useState } from 'react';
import { ConnectorConfig } from '../types/carpark';
import { BACKEND_SAMPLE_EXPRESS_CODE } from '../services/apiConnector';
import {
  X,
  Server,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Code2,
  Sliders,
  Radio,
} from 'lucide-react';

interface BackendConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConnectorConfig;
  onUpdateConfig: (updates: Partial<ConnectorConfig>) => void;
  onTestConnection: () => Promise<void>;
  isTesting: boolean;
  testResult: { success: boolean; message: string } | null;
}

export const BackendConnectorModal: React.FC<BackendConnectorModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onTestConnection,
  isTesting,
  testResult,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'schema'>('config');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(BACKEND_SAMPLE_EXPRESS_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Backend Connector Hub</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready for Integration
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connect Singapore LTA DataMall, Data.gov.sg, or your custom API endpoint
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 px-5 border-b border-slate-200 bg-white text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Data Source Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sample Express / Node.js Server
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            LTA & API Schema Spec
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'config' && (
            <div className="space-y-5">
              {/* Data Source Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Select Active Real-Time Data Source:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Option 1: Simulated Feed */}
                  <div
                    onClick={() => onUpdateConfig({ sourceType: 'simulated' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      config.sourceType === 'simulated'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Simulated Live Feed</span>
                      <Radio
                        className={`w-4 h-4 ${
                          config.sourceType === 'simulated'
                            ? 'text-blue-600 fill-blue-600'
                            : 'text-slate-300'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Authentic Singapore carpark dataset with live occupancy variance simulation.
                    </p>
                  </div>

                  {/* Option 2: Live Data.gov.sg */}
                  <div
                    onClick={() => onUpdateConfig({ sourceType: 'datagov' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      config.sourceType === 'datagov'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Data.gov.sg Live API</span>
                      <Radio
                        className={`w-4 h-4 ${
                          config.sourceType === 'datagov'
                            ? 'text-blue-600 fill-blue-600'
                            : 'text-slate-300'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Live Singapore open transport API endpoint (~2,000 HDB/URA carparks). Free, no key.
                    </p>
                  </div>

              {/* Option 3: Custom Backend / Serverless */}
                  <div
                    onClick={() => onUpdateConfig({ sourceType: 'custom' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      config.sourceType === 'custom'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Serverless /api Endpoints</span>
                      <Radio
                        className={`w-4 h-4 ${
                          config.sourceType === 'custom'
                            ? 'text-blue-600 fill-blue-600'
                            : 'text-slate-300'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Live /api/carparkavailability serverless function (LTA AccountKey proxy).
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom URL Input if Custom is Selected */}
              {config.sourceType === 'custom' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Serverless Endpoint URL:
                    </label>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ customUrl: '/api/carparkavailability' })}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-600 hover:bg-slate-50 font-mono"
                      >
                        /api/carparkavailability
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ customUrl: '/api/health' })}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-mono"
                      >
                        /api/health
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config.customUrl}
                      onChange={(e) => onUpdateConfig({ customUrl: e.target.value })}
                      placeholder="/api/carparkavailability"
                      className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={onTestConnection}
                      disabled={isTesting || !config.customUrl}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Testing...' : 'Test Endpoint'}</span>
                    </button>
                  </div>

                  {/* Serverless Endpoints Catalog Quick Links */}
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <span className="font-semibold text-slate-700">Available Serverless Endpoints:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[10px]">
                      <a href="/api/health" target="_blank" className="p-1.5 bg-white rounded border border-slate-200 text-blue-600 hover:underline flex items-center justify-between">
                        <span>/api/health</span>
                        <span className="text-slate-400 font-sans">System Status ↗</span>
                      </a>
                      <a href="/api/carparkavailability" target="_blank" className="p-1.5 bg-white rounded border border-slate-200 text-blue-600 hover:underline flex items-center justify-between">
                        <span>/api/carparkavailability</span>
                        <span className="text-slate-400 font-sans">Live Lots ↗</span>
                      </a>
                      <a href="/api/busarrival?BusStopCode=83139&ServiceNo=15" target="_blank" className="p-1.5 bg-white rounded border border-slate-200 text-blue-600 hover:underline flex items-center justify-between">
                        <span>/api/busarrival (v3)</span>
                        <span className="text-slate-400 font-sans">Next Buses ↗</span>
                      </a>
                      <a href="/api/trafficincidents" target="_blank" className="p-1.5 bg-white rounded border border-slate-200 text-blue-600 hover:underline flex items-center justify-between">
                        <span>/api/trafficincidents</span>
                        <span className="text-slate-400 font-sans">Incidents ↗</span>
                      </a>
                      <a href="/api/trainalerts" target="_blank" className="p-1.5 bg-white rounded border border-slate-200 text-blue-600 hover:underline flex items-center justify-between">
                        <span>/api/trainalerts</span>
                        <span className="text-slate-400 font-sans">Train Status ↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Connection Button for Data.gov.sg */}
              {config.sourceType === 'datagov' && (
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-emerald-900">
                      Direct Open Data Endpoint Configured
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Endpoint: https://api.data.gov.sg/v1/transport/carpark-availability
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onTestConnection}
                    disabled={isTesting}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Fetching...' : 'Fetch Live Batch'}</span>
                  </button>
                </div>
              )}

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Auto Refresh Interval */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Auto-Refresh Polling Interval:
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Off', val: 0 },
                    { label: 'Every 15s', val: 15 },
                    { label: 'Every 30s', val: 30 },
                    { label: 'Every 60s', val: 60 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => onUpdateConfig({ autoRefreshInterval: item.val })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        config.autoRefreshInterval === item.val
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Automatically refreshes lot occupancy in the background without reloading the page.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  Ready-to-use Express connector script for your backend implementation:
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-1 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
                <pre className="font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                  <code>{BACKEND_SAMPLE_EXPRESS_CODE}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  LTA DataMall & Data.gov.sg Field Mapping
                </h4>
                <p className="text-slate-500">
                  ParkSG front-end maps the following upstream fields from the Singapore government APIs:
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 text-[11px]">
                    <tr>
                      <th className="p-2.5">ParkSG Field</th>
                      <th className="p-2.5">LTA DataMall Key</th>
                      <th className="p-2.5">Data.gov.sg Key</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="p-2.5 font-semibold text-blue-600">id</td>
                      <td className="p-2.5">CarParkID</td>
                      <td className="p-2.5">carpark_number</td>
                      <td className="p-2.5 font-sans">Unique carpark identifier (e.g. TP24, ACB)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-blue-600">lots.cars.available</td>
                      <td className="p-2.5">AvailableLots (LotType C)</td>
                      <td className="p-2.5">lots_available (lot_type C)</td>
                      <td className="p-2.5 font-sans">Current real-time number of vacant car lots</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-blue-600">lots.cars.total</td>
                      <td className="p-2.5">TotalLots</td>
                      <td className="p-2.5">total_lots</td>
                      <td className="p-2.5 font-sans">Total parking lot capacity</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-blue-600">coordinates</td>
                      <td className="p-2.5">Location (Lat/Lng)</td>
                      <td className="p-2.5">x_coord, y_coord (SVY21)</td>
                      <td className="p-2.5 font-sans">Converted WGS84 GPS latitude and longitude</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                <strong>Note on LTA DataMall v2:</strong> LTA requires a free developer API key via an{' '}
                <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-300">
                  AccountKey
                </code>{' '}
                header, which cannot be called directly from browser origins due to CORS. When ready,
                deploy the sample proxy script on Node/Express to forward requests.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Current Status:{' '}
            <span className="font-semibold text-slate-800 uppercase font-mono">
              {config.sourceType}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
