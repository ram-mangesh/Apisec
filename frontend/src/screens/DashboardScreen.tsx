import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Layers,
  GitFork,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Play,
  FileText,
  Activity,
  ArrowRight,
  ShieldAlert,
  Zap,
  Radio,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Target,
} from 'lucide-react';
import { SeverityBadge, MethodBadge, StatusBadge, ScoreBadge } from '../components/Badges';
import { api, MOCK_FINDINGS, MOCK_ATTACK_PATHS } from '../api';
import { Finding, AttackPath, Project } from '../types';
import { ScreenType } from '../components/GlobalShell';
import { useTheme } from '../theme/ThemeContext';

interface DashboardScreenProps {
  currentProject: Project;
  onNavigate: (screen: ScreenType, id?: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  currentProject,
  onNavigate,
}) => {
  const { currentConfig } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [attackPaths, setAttackPaths] = useState<AttackPath[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashData, findingsData, pathsData] = await Promise.all([
          api.getDashboard(),
          api.getFindings(),
          api.getAttackPaths(),
        ]);
        setStats(dashData);
        setFindings(findingsData);
        setAttackPaths(pathsData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    }
    loadData();
  }, []);

  const handleQuickScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onNavigate('discovery');
    }, 800);
  };

  const kpis = stats?.kpis || {
    total_endpoints: 21,
    active_endpoints: 19,
    shadow_endpoints: 1,
    total_findings: 7,
    critical_findings: 3,
    high_findings: 2,
    medium_findings: 1,
    low_findings: 1,
    validated_findings: 7,
    attack_paths_count: 3,
    security_posture_score: 64,
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP COMMAND BANNER */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl cyber-card relative overflow-hidden bg-white">
        <div className="flex items-start sm:items-center gap-4">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
            style={{
              background: `linear-gradient(135deg, ${currentConfig.primary}, ${currentConfig.primaryHover})`,
              boxShadow: `0 4px 16px ${currentConfig.glow}`,
            }}
          >
            <ShieldAlert className="h-7 w-7" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-mono">
                SECURITY COMMAND CENTER
              </h1>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border"
                style={{
                  backgroundColor: currentConfig.badgeBg,
                  color: currentConfig.badgeText,
                  borderColor: currentConfig.badgeBorder,
                }}
              >
                <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: currentConfig.primary }} />
                TARGET: {currentProject.name}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
              Live multi-hop attack path synthesis, authorization differential engine & multi-scanner mesh.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 z-10 font-mono">
          <button
            onClick={handleQuickScan}
            disabled={isScanning}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:scale-102 cursor-pointer cyber-glow-btn"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Syncing Mesh...' : 'Trigger Scan Mesh'}</span>
          </button>
          <button
            onClick={() => onNavigate('copilot')}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>AI Copilot</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LIVE THREAT TICKER */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono overflow-hidden shadow-xs">
        <div className="flex items-center gap-1.5 text-rose-600 font-bold shrink-0 uppercase tracking-wider text-[11px]">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span>LIVE EXPLOIT FEED:</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-none text-slate-700 text-[11px]">
          <span className="hover:text-slate-900 cursor-pointer" onClick={() => onNavigate('findings', 'F-1021')}>
            [CRITICAL] Hop 1: <code className="text-purple-700 font-bold">GET /api/v1/system/debug</code> leaked <code className="text-amber-700 font-bold">usr_alice_8821</code>
          </span>
          <span className="text-slate-300">|</span>
          <span className="hover:text-slate-900 cursor-pointer" onClick={() => onNavigate('findings', 'F-1022')}>
            [BOLA EXPLOITED] Hop 2: <code className="text-purple-700 font-bold">/tenants/org_acme_a01/users/usr_alice_8821</code> balance leaked
          </span>
          <span className="text-slate-300">|</span>
          <span className="hover:text-slate-900 cursor-pointer" onClick={() => onNavigate('findings', 'F-1024')}>
            [BFLA CONFIRMED] Hop 4: <code className="text-rose-600 font-bold">$85,000 Payout Takeover</code> unauthorized execution
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 5 HIGH-TECH KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Endpoints */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-4 rounded-2xl cyber-card cursor-pointer group flex flex-col justify-between min-h-[130px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              API Catalog
            </span>
            <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-sky-100">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono">{kpis.total_endpoints}</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>19 Active + 1 Shadow</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Findings */}
        <div
          onClick={() => onNavigate('findings')}
          className="p-4 rounded-2xl cyber-card cursor-pointer group flex flex-col justify-between min-h-[130px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Vulnerabilities
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-rose-100">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-rose-600 font-mono">{kpis.total_findings}</div>
            <div className="text-[11px] text-rose-700 font-mono mt-1 font-semibold">
              {kpis.critical_findings} Critical | {kpis.high_findings} High
            </div>
          </div>
        </div>

        {/* KPI 3: Attack Paths */}
        <div
          onClick={() => onNavigate('attack-paths')}
          className="p-4 rounded-2xl cyber-card cursor-pointer group flex flex-col justify-between min-h-[130px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Attack Paths
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-amber-100">
              <GitFork className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-600 font-mono">{kpis.attack_paths_count}</div>
            <div className="text-[11px] text-amber-700 font-mono mt-1 font-semibold">
              3 Choke-Points Identified
            </div>
          </div>
        </div>

        {/* KPI 4: Evidence Validated */}
        <div
          onClick={() => onNavigate('validation')}
          className="p-4 rounded-2xl cyber-card cursor-pointer group flex flex-col justify-between min-h-[130px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Validation Rate
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 font-mono">100%</div>
            <div className="text-[11px] text-emerald-700 font-mono mt-1 font-semibold">
              {kpis.validated_findings}/{kpis.total_findings} Verified Live
            </div>
          </div>
        </div>

        {/* KPI 5: Posture Score */}
        <div className="p-4 rounded-2xl cyber-card flex flex-col justify-between min-h-[130px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Posture Score
            </span>
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
              style={{
                backgroundColor: currentConfig.badgeBg,
                color: currentConfig.badgeText,
              }}
            >
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-slate-900 flex items-baseline gap-1">
              <span>{kpis.security_posture_score}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="text-[11px] text-rose-600 font-mono mt-1 flex items-center gap-1 font-bold">
              <AlertTriangle className="h-3 w-3" />
              <span>HIGH RISK (Exploit Chain)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MULTI-SCANNER MESH STATUS & SEVERITY BREAKDOWN */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 4-Scanner Mesh Orchestrator (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl cyber-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
              <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">
                Multi-Scanner Orchestration Mesh
              </h3>
            </div>
            <button
              onClick={() => onNavigate('discovery')}
              className="text-xs font-mono font-bold hover:underline flex items-center gap-1"
              style={{ color: currentConfig.primary }}
            >
              <span>Manage Mesh</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Custom Port Scanning Engine */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-slate-900">1. Custom Port Scanning Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-600">Discovered 4 open network ports (80, 443, 8001, 8088 Shadow)</p>
              <div className="text-[10px] font-mono text-slate-400">Latency: 1.2ms</div>
            </div>

            {/* 2. Common Vulnerability Enumeration Engine */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-all space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-slate-900">2. Common Vulnerability Enumeration Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-600">142 vulnerability exposure templates scanned (Debug leak flagged)</p>
              <div className="text-[10px] font-mono text-slate-400">Ruleset: v3.2.1</div>
            </div>

            {/* 3. Dynamic Application Security Testing Engine */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-all space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-slate-900">3. Dynamic Application Security Testing Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-600">Active & passive DAST spider and differential fuzzing</p>
              <div className="text-[10px] font-mono text-slate-400">BOLA probes: 42 sent</div>
            </div>

            {/* 4. Deep Logic & Business Flaw Engine */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-slate-900">4. Deep Logic & Business Flaw Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-600">Deep crawl and BFLA permission bypass simulation</p>
              <div className="text-[10px] font-mono text-slate-400">Engine: Enterprise v24.2</div>
            </div>
          </div>
        </div>

        {/* Right: Severity Donut & Graph Synthesis (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl cyber-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">
              Vulnerability Posture Breakdown
            </h3>
            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Peak CVSS 9.6
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#DC2626" strokeWidth="12" strokeDasharray="102 238" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#EA580C" strokeWidth="12" strokeDasharray="68 238" strokeDashoffset="-102" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#CA8A04" strokeWidth="12" strokeDasharray="34 238" strokeDashoffset="-170" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#16A34A" strokeWidth="12" strokeDasharray="34 238" strokeDashoffset="-204" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-mono text-slate-900">7</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Findings</span>
              </div>
            </div>

            {/* Severity Legend */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-rose-700 font-bold">
                  <span className="h-2 w-2 rounded-full bg-rose-600" />
                  <span>Critical (3)</span>
                </div>
                <span className="text-slate-500">42.8%</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-orange-700 font-bold">
                  <span className="h-2 w-2 rounded-full bg-orange-600" />
                  <span>High (2)</span>
                </div>
                <span className="text-slate-500">28.5%</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-yellow-700 font-bold">
                  <span className="h-2 w-2 rounded-full bg-yellow-600" />
                  <span>Medium (1)</span>
                </div>
                <span className="text-slate-500">14.3%</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span>Low (1)</span>
                </div>
                <span className="text-slate-500">14.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CORRELATED ATTACK PATHS CAROUSEL */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl cyber-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <GitFork className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">
              Correlated Multi-Hop Exploit Chains ({attackPaths.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('attack-paths')}
            className="text-xs font-mono font-bold hover:underline flex items-center gap-1"
            style={{ color: currentConfig.primary }}
          >
            <span>Open Attack Graph Visualizer</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {attackPaths.slice(0, 3).map((ap) => (
            <div
              key={ap.id}
              onClick={() => onNavigate('attack-paths', ap.id)}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-slate-100/70 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs" style={{ color: currentConfig.primary }}>{ap.id}</span>
                  <SeverityBadge severity={ap.risk_level} size="sm" />
                </div>
                <div className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                  {ap.title}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{ap.subtitle}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] font-mono flex items-center justify-between text-slate-600">
                <span>Choke: <strong className="text-amber-700">{ap.choke_point}</strong></span>
                <span className="font-bold group-hover:translate-x-1 transition-transform" style={{ color: currentConfig.primary }}>Inspect →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. PRIORITY FINDINGS TABLE */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl cyber-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">
              Priority Security Findings
            </h3>
          </div>
          <button
            onClick={() => onNavigate('findings')}
            className="text-xs font-mono font-bold hover:underline flex items-center gap-1"
            style={{ color: currentConfig.primary }}
          >
            <span>View All ({findings.length})</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="font-mono text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="py-2.5 px-3">Finding</th>
                <th className="py-2.5 px-3">Endpoint Route</th>
                <th className="py-2.5 px-3">CVSS</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {findings.slice(0, 5).map((f) => (
                <tr
                  key={f.id}
                  onClick={() => onNavigate('findings', f.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 text-xs">{f.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{f.id} • {f.cwe}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    <code className="text-[11px] text-purple-700 font-bold">{f.endpoint}</code>
                  </td>
                  <td className="py-3 px-3">
                    <ScoreBadge score={f.cvss} />
                  </td>
                  <td className="py-3 px-3">
                    <SeverityBadge severity={f.severity} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={f.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('validation', f.id);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-purple-100 text-purple-700 font-mono text-[10px] font-bold border border-purple-200 transition-all"
                    >
                      Probe Live
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
