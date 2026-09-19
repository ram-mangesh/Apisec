import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  Server,
  Key,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { MethodBadge, SeverityBadge, StatusBadge } from '../components/Badges';
import { MOCK_ENDPOINTS } from '../api';
import { ApiEndpoint, HttpMethod } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface InventoryScreenProps {
  onSelectEndpoint: (endpointId: string) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  onSelectEndpoint,
}) => {
  const { currentConfig } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const services = ['All', 'User Service', 'Payment Service', 'Order Service', 'Admin Service'];
  const risks = ['All', 'Critical', 'High', 'Medium', 'Low', 'Safe'];
  const methods = ['All', 'GET', 'POST', 'PUT', 'DELETE'];
  const statuses = ['All', 'Active', 'Shadow', 'Internal'];

  const filteredEndpoints = useMemo(() => {
    return MOCK_ENDPOINTS.filter((ep) => {
      const matchSearch =
        ep.path.toLowerCase().includes(search.toLowerCase()) ||
        ep.service.toLowerCase().includes(search.toLowerCase()) ||
        ep.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
        ep.parameters.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));

      const matchService = selectedService === 'All' || ep.service === selectedService;
      const matchRisk = selectedRisk === 'All' || ep.risk_level.toLowerCase() === selectedRisk.toLowerCase();
      const matchMethod = selectedMethod === 'All' || ep.method === selectedMethod;
      const matchStatus = selectedStatus === 'All' || ep.status === selectedStatus;

      return matchSearch && matchService && matchRisk && matchMethod && matchStatus;
    });
  }, [search, selectedService, selectedRisk, selectedMethod, selectedStatus]);

  const totalCount = MOCK_ENDPOINTS.length;
  const shadowCount = MOCK_ENDPOINTS.filter((e) => e.status === 'Shadow').length;
  const criticalCount = MOCK_ENDPOINTS.filter((e) => e.risk_level === 'Critical').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header & Quick Stat Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl cyber-card bg-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              API INVENTORY & ATTACK SURFACE
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold uppercase"
              style={{
                backgroundColor: currentConfig.badgeBg,
                color: currentConfig.badgeText,
                borderColor: currentConfig.badgeBorder,
              }}
            >
              {totalCount} Endpoints
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Catalog of all discovered routes, authentication requirements, parameter schemas, and risk tiers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <span className="text-slate-400 mr-1">Active:</span> 19
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-bold">
            <span className="text-purple-400 mr-1">Shadow:</span> {shadowCount}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold">
            <span className="text-rose-400 mr-1">Critical:</span> {criticalCount}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl cyber-card space-y-3 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search route (e.g. /users/{id}), service, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden font-mono"
            />
          </div>

          {/* Service Dropdown */}
          <div>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden font-mono"
            >
              {services.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Services' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Dropdown */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden font-mono"
            >
              {risks.map((r) => (
                <option key={r} value={r}>
                  {r === 'All' ? 'All Risk Levels' : `${r} Risk`}
                </option>
              ))}
            </select>
          </div>

          {/* Method Dropdown */}
          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden font-mono"
            >
              {methods.map((m) => (
                <option key={m} value={m}>
                  {m === 'All' ? 'All Methods' : m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Summary Strip */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-900">{filteredEndpoints.length}</strong> of{' '}
            {totalCount} total endpoints
          </span>
          {(search || selectedService !== 'All' || selectedRisk !== 'All' || selectedMethod !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedService('All');
                setSelectedRisk('All');
                setSelectedMethod('All');
                setSelectedStatus('All');
              }}
              className="hover:underline font-bold"
              style={{ color: currentConfig.primary }}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Main Endpoints Table */}
      <div className="p-5 rounded-2xl cyber-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 w-20">Method</th>
                <th className="py-3 px-3">Endpoint Path</th>
                <th className="py-3 px-3">Service</th>
                <th className="py-3 px-3">Auth Scheme</th>
                <th className="py-3 px-3">Risk Tier</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Parameters</th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEndpoints.map((ep) => (
                <tr
                  key={ep.id}
                  onClick={() => onSelectEndpoint(ep.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3">
                    <MethodBadge method={ep.method} size="sm" />
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    <span>{ep.path}</span>
                    <div className="flex gap-1.5 mt-1 font-sans">
                      {ep.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-600 font-sans">
                    {ep.service}
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px]">
                    <span className={`px-2 py-0.5 rounded border text-[10px] ${
                      ep.auth === 'None'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {ep.auth}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <SeverityBadge severity={ep.risk_level} size="sm" />
                  </td>

                  <td className="py-3 px-3">
                    <StatusBadge status={ep.status} size="sm" />
                  </td>

                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    {ep.parameters.length > 0 ? (
                      <span className="text-slate-800">
                        {ep.parameters.length} params{' '}
                        <span className="text-slate-400">
                          ({ep.parameters.map((p) => p.name).join(', ')})
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEndpoint(ep.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-purple-50 group-hover:text-purple-700 text-slate-500 transition-colors"
                      title="Analyze Endpoint"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
