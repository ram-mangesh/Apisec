import React, { useState } from 'react';
import {
  FileCode2,
  Play,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Database,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  GitFork,
  Send,
  RefreshCw,
} from 'lucide-react';
import { MethodBadge, SeverityBadge, StatusBadge } from '../components/Badges';
import { CodeViewer } from '../components/CodeViewer';
import { MOCK_ENDPOINTS, MOCK_FINDINGS, MOCK_ATTACK_PATHS, MOCK_PROJECTS } from '../api';
import { ApiEndpoint } from '../types';
import { ScreenType } from '../components/GlobalShell';
import { useTheme } from '../theme/ThemeContext';

interface EndpointAnalysisScreenProps {
  endpointId?: string;
  onNavigate: (screen: ScreenType, id?: string) => void;
}

export const EndpointAnalysisScreen: React.FC<EndpointAnalysisScreenProps> = ({
  endpointId = 'ep-user-01',
  onNavigate,
}) => {
  const { currentConfig } = useTheme();
  const [selectedId, setSelectedId] = useState<string>(endpointId);
  const [selectedIdentity, setSelectedIdentity] = useState('acc_user_b');
  const [probeRunning, setProbeRunning] = useState(false);
  const [probeResult, setProbeResult] = useState<any>(null);

  const endpoint = MOCK_ENDPOINTS.find((ep) => ep.id === selectedId) || MOCK_ENDPOINTS[0];
  const associatedFindings = MOCK_FINDINGS.filter((f) => f.endpoint.includes(endpoint.path));
  const testAccounts = MOCK_PROJECTS[0].test_accounts;

  const handleRunTestProbe = () => {
    setProbeRunning(true);
    setTimeout(() => {
      setProbeRunning(false);
      setProbeResult({
        status_code: 200,
        status_text: '200 OK',
        violation: true,
        diff_summary:
          'UNAUTHORIZED DATA EXFILTRATION: Role "customer" successfully queried resource belonging to another tenant.',
        response_body: endpoint.response_example || '{\n  "status": "success"\n}',
        latency_ms: 42,
      });
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Top Header & Endpoint Switcher Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl cyber-card bg-white">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <MethodBadge method={endpoint.method} size="lg" />
            <h1 className="text-base sm:text-lg font-bold font-mono text-slate-900 truncate">
              {endpoint.path}
            </h1>
            <SeverityBadge severity={endpoint.risk_level} size="md" />
            <StatusBadge status={endpoint.status} size="md" />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Server className="h-3.5 w-3.5 text-slate-400" />
              {endpoint.service}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Key className="h-3.5 w-3.5 text-amber-500" />
              Auth: <strong className="text-slate-800">{endpoint.auth}</strong>
            </span>
            <span>•</span>
            <span>Source: {endpoint.source}</span>
          </div>
        </div>

        {/* Switch Endpoint Quick Selector */}
        <div className="flex items-center gap-2 z-10">
          <label className="text-xs text-slate-500 font-mono shrink-0">Switch API:</label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setProbeResult(null);
            }}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden"
          >
            {MOCK_ENDPOINTS.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.method} {ep.path} ({ep.service})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Parameters, Examples, Probe Simulator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parameter Schema Specification */}
          <div className="p-5 rounded-2xl cyber-card space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-mono">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Database className="h-4 w-4" style={{ color: currentConfig.primary }} />
                Parameter Schema & Inferred Entities
              </h3>
              <span className="text-xs text-slate-400">
                {endpoint.parameters.length} Parameters
              </span>
            </div>

            {endpoint.parameters.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Required</th>
                      <th className="py-2.5 px-3">Inferred Entity / Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {endpoint.parameters.map((param, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold" style={{ color: currentConfig.primary }}>
                          {param.name}
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] text-slate-500">
                          {param.location}
                        </td>
                        <td className="py-2.5 px-3 text-purple-700">
                          {param.param_type}
                        </td>
                        <td className="py-2.5 px-3">
                          {param.required ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                              YES
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">optional</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-sans">
                          {param.inferred_entity && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[10px] mr-1.5">
                              @{param.inferred_entity}
                            </span>
                          )}
                          <span>{param.description || '—'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic p-3 text-center bg-slate-50 rounded-xl font-mono">
                No request parameters required for this endpoint.
              </div>
            )}
          </div>

          {/* Code Spec & Request/Response Samples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-700 block uppercase">Baseline Request Spec</span>
              <CodeViewer
                code={endpoint.request_example || `${endpoint.method} ${endpoint.path} HTTP/1.1\nHost: api.acmeprod.io\nAccept: application/json`}
                language="http"
                filename="Request Headers & Payload"
                maxHeight="220px"
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-700 block uppercase">Sample Response Payload</span>
              <CodeViewer
                code={endpoint.response_example || '{\n  "status": "ok"\n}'}
                language="json"
                filename="HTTP 200 JSON Response"
                maxHeight="220px"
              />
            </div>
          </div>

          {/* Interactive Live Test Probe Simulator */}
          <div className="p-5 rounded-2xl cyber-card space-y-4 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-mono">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                  <Play className="h-4 w-4 text-emerald-600" />
                  Live Differential Authorization Prober
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Fire real-time HTTP probes from secondary test identity to test BOLA & BFLA boundaries.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] font-mono text-slate-500 uppercase mb-1 font-semibold">
                  Probe Identity Actor:
                </label>
                <select
                  value={selectedIdentity}
                  onChange={(e) => setSelectedIdentity(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                >
                  {testAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (Role: {acc.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleRunTestProbe}
                  disabled={probeRunning}
                  className="h-10 px-5 rounded-xl cyber-glow-btn text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer font-mono"
                >
                  <Send className={`h-3.5 w-3.5 ${probeRunning ? 'animate-spin' : ''}`} />
                  <span>{probeRunning ? 'Probing Target...' : 'Fire Probe'}</span>
                </button>
              </div>
            </div>

            {probeResult && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs font-mono animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-rose-800">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    AUTHORIZATION VIOLATION DETECTED
                  </span>
                  <span>Latency: {probeResult.latency_ms}ms</span>
                </div>
                <p className="text-slate-700 font-sans">{probeResult.diff_summary}</p>
                <div className="pt-2">
                  <CodeViewer
                    code={probeResult.response_body}
                    language="json"
                    filename="Live Exfiltrated Data Payload"
                    maxHeight="160px"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Linked Findings & Attack Paths */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl cyber-card space-y-4 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-mono">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Vulnerabilities Flagged ({associatedFindings.length})
              </h3>
            </div>

            <div className="space-y-3">
              {associatedFindings.map((f) => (
                <div
                  key={f.id}
                  onClick={() => onNavigate('findings', f.id)}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold" style={{ color: currentConfig.primary }}>{f.id}</span>
                    <SeverityBadge severity={f.severity} size="sm" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                    {f.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">CWE: {f.cwe} • CVSS {f.cvss}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
