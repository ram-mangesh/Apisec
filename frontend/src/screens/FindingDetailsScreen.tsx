import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  GitFork,
  ArrowRight,
  Split,
  Play,
  Sparkles,
  ExternalLink,
  Shield,
  Server,
  Layers,
  Copy,
  Check,
  Table as TableIcon,
  Search,
  Filter,
  Code,
  Terminal,
  Activity,
  Zap,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { SeverityBadge, MethodBadge, StatusBadge, ScoreBadge } from '../components/Badges';
import { CodeViewer } from '../components/CodeViewer';
import { MOCK_FINDINGS, MOCK_ATTACK_PATHS, MOCK_EVIDENCES } from '../api';
import { Finding } from '../types';
import { ScreenType } from '../components/GlobalShell';
import { useTheme } from '../theme/ThemeContext';

interface FindingDetailsScreenProps {
  findingId?: string;
  onNavigate: (screen: ScreenType, id?: string) => void;
}

export const FindingDetailsScreen: React.FC<FindingDetailsScreenProps> = ({
  findingId = 'F-1021',
  onNavigate,
}) => {
  const { currentConfig } = useTheme();
  const [selectedId, setSelectedId] = useState<string>(findingId);
  const [viewMode, setViewMode] = useState<'detail' | 'list'>('detail');
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'evidence' | 'patch' | 'attack-path'>('overview');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterService, setFilterService] = useState('All');
  const [search, setSearch] = useState('');
  const [patchApplied, setPatchApplied] = useState(false);

  const finding: Finding =
    MOCK_FINDINGS.find((f) => f.id.toLowerCase() === selectedId.toLowerCase()) || MOCK_FINDINGS[0];

  const evidence = MOCK_EVIDENCES[finding.id] || MOCK_EVIDENCES['ev-1021'];
  const linkedAttackPath =
    MOCK_ATTACK_PATHS.find((ap) => ap.steps.some((s) => s.finding_id === finding.id)) ||
    MOCK_ATTACK_PATHS[0];

  const filteredFindings = MOCK_FINDINGS.filter((f) => {
    const matchSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toLowerCase().includes(search.toLowerCase()) ||
      f.cwe.toLowerCase().includes(search.toLowerCase()) ||
      f.endpoint.toLowerCase().includes(search.toLowerCase());
    const matchSev = filterSeverity === 'All' || f.severity === filterSeverity;
    const matchServ = filterService === 'All' || f.service === filterService;
    return matchSearch && matchSev && matchServ;
  });

  const handleApplyPatchSimulation = () => {
    setPatchApplied(true);
    setTimeout(() => setPatchApplied(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Top Header & View Mode Controls */}
      <div className="p-5 rounded-2xl cyber-card space-y-3.5 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">
                {viewMode === 'list' ? 'Vulnerability Findings' : 'Finding Remediation Details'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
                7 Proved
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Verified security vulnerabilities with differential authorization proof and framework-ready patches.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 font-mono">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span>All Findings</span>
              </button>
              <button
                onClick={() => setViewMode('detail')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'detail'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                <span>Detail View</span>
              </button>
            </div>

            {viewMode === 'detail' && (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-medium focus:outline-hidden"
              >
                {MOCK_FINDINGS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id}: {f.title.slice(0, 32)}...
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Action CTAs in Detail Mode */}
        {viewMode === 'detail' && (
          <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 flex-wrap font-mono">
            <button
              onClick={() => onNavigate('evidence', finding.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              <Split className="h-3.5 w-3.5 text-slate-600" />
              <span>Evidence Diff</span>
            </button>

            <button
              onClick={() => onNavigate('validation', finding.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 cyber-glow-btn rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Fire Live Prober</span>
            </button>

            <button
              onClick={() => onNavigate('copilot')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>Explain in Copilot</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW MODE: ALL FINDINGS LIST */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl cyber-card flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search findings by ID, CWE, title, route, or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="All">All Services</option>
                <option value="User Service">User Service</option>
                <option value="Payment Service">Payment Service</option>
                <option value="Order Service">Order Service</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="p-4 sm:p-5 rounded-2xl cyber-card overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3.5 px-3.5">ID</th>
                    <th className="py-3.5 px-3.5">Vulnerability Title & CWE</th>
                    <th className="py-3.5 px-3.5">Severity</th>
                    <th className="py-3.5 px-3.5">Target Route</th>
                    <th className="py-3.5 px-3.5">Service</th>
                    <th className="py-3.5 px-3.5">CVSS</th>
                    <th className="py-3.5 px-3.5">Proof Status</th>
                    <th className="py-3.5 px-3.5 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFindings.map((f) => (
                    <tr
                      key={f.id}
                      onClick={() => {
                        setSelectedId(f.id);
                        setViewMode('detail');
                      }}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-3.5 font-bold" style={{ color: currentConfig.primary }}>
                        {f.id}
                      </td>
                      <td className="py-3.5 px-3.5 max-w-sm">
                        <div className="font-bold text-slate-900 group-hover:text-purple-700 font-sans text-xs">
                          {f.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{f.cwe}</div>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <SeverityBadge severity={f.severity} size="sm" />
                      </td>
                      <td className="py-3.5 px-3.5 text-purple-700 font-bold text-[11px]">
                        {f.endpoint}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-700 font-sans">
                        {f.service}
                      </td>
                      <td className="py-3.5 px-3.5">
                        <ScoreBadge score={f.cvss} />
                      </td>
                      <td className="py-3.5 px-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          100% Proved
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(f.id);
                            setViewMode('detail');
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200 transition-colors"
                        >
                          Deep Dive →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW MODE: DETAIL VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'detail' && (
        <div className="space-y-6">
          {/* Top Quick Stats Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-xl cyber-card bg-white space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Severity Rating</span>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={finding.severity} size="md" />
                <ScoreBadge score={finding.cvss} />
              </div>
            </div>

            <div className="p-4 rounded-xl cyber-card bg-white space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Target Service & Route</span>
              <div className="text-xs font-bold text-slate-900 truncate">{finding.service}</div>
              <code className="text-[11px] text-purple-700 truncate block">{finding.endpoint}</code>
            </div>

            <div className="p-4 rounded-xl cyber-card bg-white space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Linked Exploit Chain</span>
              <div
                onClick={() => onNavigate('attack-paths', linkedAttackPath.id)}
                className="text-xs font-bold text-purple-700 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{linkedAttackPath.id}: {linkedAttackPath.title.slice(0, 26)}...</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] text-slate-500">Choke: {linkedAttackPath.choke_point}</span>
            </div>

            <div className="p-4 rounded-xl cyber-card bg-white space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Validation Status</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Deterministic Proof Proved</span>
              </div>
              <span className="text-[10px] text-slate-500">Confidence: {finding.confidence}% Zero FP</span>
            </div>
          </div>

          {/* Navigation Detail Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto font-mono text-xs font-bold">
            <button
              onClick={() => setActiveDetailTab('overview')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeDetailTab === 'overview'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Overview & Analysis
            </button>
            <button
              onClick={() => setActiveDetailTab('evidence')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeDetailTab === 'evidence'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Differential Evidence Diff
            </button>
            <button
              onClick={() => setActiveDetailTab('patch')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeDetailTab === 'patch'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Code Remediation Patch
            </button>
            <button
              onClick={() => setActiveDetailTab('attack-path')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeDetailTab === 'attack-path'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Causal Graph Position
            </button>
          </div>

          {/* Sub-Tab 1: Overview & Metrics */}
          {activeDetailTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Details & Description */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl cyber-card space-y-4 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-purple-700">{finding.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-600 font-semibold">{finding.cwe}</span>
                    </div>
                    <SeverityBadge severity={finding.severity} size="md" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-sans">{finding.title}</h2>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed font-sans">{finding.description}</p>
                  </div>

                  {/* Impact */}
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                    <span className="text-xs font-mono font-bold text-rose-900 uppercase">Security Impact:</span>
                    <p className="text-xs text-slate-800 font-sans leading-relaxed">{finding.impact}</p>
                  </div>

                  {/* Remediation */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-xs font-mono font-bold text-emerald-900 uppercase">Remediation Strategy:</span>
                    <p className="text-xs text-slate-800 font-sans leading-relaxed">{finding.remediation}</p>
                  </div>
                </div>
              </div>

              {/* Right 1 Col: CVSS Metrics Matrix */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl cyber-card space-y-4 font-mono bg-white">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 uppercase">CVSS v3.1 Scoring Matrix</h3>
                    <ScoreBadge score={finding.cvss} />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-600">Attack Vector (AV):</span>
                      <span className="font-bold text-slate-900">Network (N)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-600">Attack Complexity (AC):</span>
                      <span className="font-bold text-slate-900">Low (L)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-600">Privileges Required (PR):</span>
                      <span className="font-bold text-slate-900">Low / Standard (L)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-600">User Interaction (UI):</span>
                      <span className="font-bold text-slate-900">None (N)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-600">Confidentiality (C):</span>
                      <span className="font-bold text-rose-700">High (H)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-600">Integrity (I):</span>
                      <span className="font-bold text-rose-700">High (H)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-600">Availability (A):</span>
                      <span className="font-bold text-slate-900">Low (L)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Evidence Diff View */}
          {activeDetailTab === 'evidence' && (
            <div className="p-6 rounded-2xl cyber-card space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-900 uppercase">Dual-Token Differential Authorization Proof</h3>
                  <p className="text-xs text-slate-500 font-sans">{evidence.diff_summary}</p>
                </div>
                <button
                  onClick={() => onNavigate('evidence', finding.id)}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-mono font-bold transition-colors"
                >
                  Full Evidence Inspector →
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-slate-700">Legitimate Tenant A Request:</span>
                  <CodeViewer code={evidence.baseline_request} language="http" filename="Baseline Request" maxHeight="200px" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-rose-700">Unauthorized Probe Request:</span>
                  <CodeViewer code={evidence.probe_request} language="http" filename="Probe Request (Bypass)" maxHeight="200px" />
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Code Patch View */}
          {activeDetailTab === 'patch' && (
            <div className="p-6 rounded-2xl cyber-card space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-900 uppercase flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-emerald-600" />
                    Automated Framework Patch (FastAPI / Express / Spring)
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">Enforce object-level tenant scoping and permission checks at route level.</p>
                </div>

                <button
                  onClick={handleApplyPatchSimulation}
                  className="px-4 py-2 cyber-glow-btn rounded-xl text-xs font-mono font-bold uppercase cursor-pointer"
                >
                  {patchApplied ? '✓ Patch Simulated' : 'Simulate Patch Apply'}
                </button>
              </div>

              <CodeViewer
                code={finding.code_fix?.diff || finding.code_fix?.code || '# Code patch available'}
                language="diff"
                filename="Patch Fix Diff"
                maxHeight="320px"
              />
            </div>
          )}

          {/* Sub-Tab 4: Attack Path Position */}
          {activeDetailTab === 'attack-path' && (
            <div className="p-6 rounded-2xl cyber-card space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-900 uppercase">Causal Graph Association: {linkedAttackPath.id}</h3>
                  <p className="text-xs text-slate-500 font-sans">{linkedAttackPath.title}</p>
                </div>

                <button
                  onClick={() => onNavigate('attack-paths', linkedAttackPath.id)}
                  className="px-4 py-2 cyber-glow-btn rounded-xl text-xs font-mono font-bold uppercase"
                >
                  Open Graph Visualizer →
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-2">
                <div className="font-bold text-slate-900">Attack Path Summary:</div>
                <p className="text-slate-700 font-sans">{linkedAttackPath.subtitle}</p>
                <div className="pt-2 border-t border-slate-200 text-amber-800 font-bold">
                  Min-Cut Choke Point: {linkedAttackPath.choke_point}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
