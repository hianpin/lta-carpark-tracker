import React from 'react';
import { RefreshCw, Server, Calculator, Layers } from 'lucide-react';
import { ConnectorConfig } from '../types/carpark';

interface HeaderProps {
  onOpenCalculator: () => void;
  onOpenConnector: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  connectorConfig: ConnectorConfig;
  activeLayout: 'split' | 'map' | 'list';
  onSelectLayout: (layout: 'split' | 'map' | 'list') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCalculator,
  onOpenConnector,
  onRefreshData,
  isRefreshing,
  connectorConfig,
  activeLayout,
  onSelectLayout,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
      {/* Zone 1: Brand title, one line wordmark */}
      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-base shadow-xs group-hover:bg-red-700 transition-colors">
            P
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            ParkSG
          </span>
        </a>
      </div>

      {/* Zone 2: 4-5 concise single-line nav controls with clean affordances */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
        <button
          type="button"
          onClick={() => onSelectLayout('split')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeLayout === 'split' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          Split View
        </button>
        <button
          type="button"
          onClick={() => onSelectLayout('map')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeLayout === 'map' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          Full Map
        </button>
        <button
          type="button"
          onClick={() => onSelectLayout('list')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeLayout === 'list' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          Carparks Directory
        </button>
        <button
          type="button"
          onClick={onOpenCalculator}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Calculator className="w-3.5 h-3.5 text-slate-400" />
          <span>Fee Calculator</span>
        </button>
        <button
          type="button"
          onClick={onOpenConnector}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span>API Connector</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenConnector}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors whitespace-nowrap shrink-0"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="capitalize">{connectorConfig.sourceType} API</span>
        </button>

        <button
          type="button"
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Live Lots'}</span>
        </button>
      </div>
    </header>
  );
};
