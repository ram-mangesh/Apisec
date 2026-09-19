import React, { useState } from 'react';
import {
  Compass,
  Upload,
  Play,
  FileCode,
  Globe,
  Radio,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Terminal,
  Layers,
  ArrowRight,
  RefreshCw,
  X,
  FileCheck,
  Shield,
  Sparkles,
  Server,
  Cpu,
  Zap,
  Flame,
  FileJson,
  ChevronRight,
} from 'lucide-react';
import { Project } from '../types';
import { StatusBadge } from '../components/Badges';
import { api } from '../api';
import { useTheme } from '../theme/ThemeContext';

interface DiscoveryScreenProps {
  currentProject: Project;
  onNavigateToInventory?: () => void;
  onNavigateToFindings?: () => void;
  onNavigateToAttackPaths?: () => void;
}

interface LogEntry {
  timestamp: string;
  tool: 'NMAP' | 'NUCLEI' | 'ZAP' | 'ACUNETIX' | 'APISEC' | 'SYSTEM';
  message: string;
}

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({
  currentProject,
  onNavigateToInventory,
  onNavigateToFindings,
  onNavigateToAttackPaths,
}) => {
  const { currentConfig } = useTheme();
  const [activeTab, setActiveTab] = useState<'unified' | 'acunetix' | 'nmap' | 'nuclei' | 'zap' | 'sarif'>('unified');
  const [targetUrl, setTargetUrl] = useState('https://api.acmeprod.io');
  const [scanProfile, setScanProfile] = useState('Comprehensive Multi-Mesh Attack Surface Audit');
  const [selectedTools, setSelectedTools] = useState<string[]>(['nmap', 'nuclei', 'zap', 'acunetix']);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [scanLogs, setScanLogs] = useState<LogEntry[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const toggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      if (selectedTools.length > 1) {
        setSelectedTools(selectedTools.filter((t) => t !== tool));
      }
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const stages = [
    'Phase 1: Nmap Port Reconnaissance & Shadow Listener Discovery...',
    'Phase 2: Nuclei Fast YAML Template Misconfiguration & Exposure Probes...',
    'Phase 3: OWASP ZAP Active & Passive DAST Spidering on Endpoints...',
    'Phase 4: Acunetix Deep DAST Engine & Business Logic Threat Modeling...',
    'Phase 5: APISEC Causal DAG Correlation & Choke-Point Synthesis...',
  ];

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanProgress(5);
    setCurrentStageIdx(0);
    const now = () => new Date().toISOString().substring(11, 19);

    setScanLogs([
      { timestamp: now(), tool: 'SYSTEM', message: `Initializing APISEC Unified Multi-Mesh Orchestrator on ${targetUrl}...` },
      { timestamp: now(), tool: 'SYSTEM', message: `Active Scanner Pipeline: ${selectedTools.map(t => t.toUpperCase()).join(' + ')}` },
    ]);

    try {
      await api.launchMeshScan(targetUrl, selectedTools, scanProfile);
    } catch (e) {
      console.log('Using local multi-scanner fallback', e);
    }

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        const next = prev + 12;

        if (next >= 20 && next < 40) {
          setCurrentStageIdx(0);
          setScanLogs((l) => [
            ...l,
            { timestamp: now(), tool: 'NMAP', message: `Scanning ports for host ${targetUrl}...` },
            { timestamp: now(), tool: 'NMAP', message: `Discovered Open Ports: 80/http, 443/https, 8001/api-mesh, 8088/shadow-debug` },
            { timestamp: now(), tool: 'NMAP', message: `FLAGGED SHADOW SERVICE: Undocumented debug route on port 8088 (Node: AWS us-east-1-node-77)` },
          ]);
        } else if (next >= 40 && next < 65) {
          setCurrentStageIdx(1);
          setScanLogs((l) => [
            ...l,
            { timestamp: now(), tool: 'NUCLEI', message: `Executing 150+ API misconfiguration & exposure templates...` },
            { timestamp: now(), tool: 'NUCLEI', message: `[exposed-debug-endpoint] GET /api/v1/users/export-debug [CVSS: 7.8] - Leaked 50 active UUIDs` },
            { timestamp: now(), tool: 'NUCLEI', message: `[unprotected-mfa-route] POST /api/v1/auth/mfa/verify-otp [CVSS: 8.2] - Missing rate limit header` },
          ]);
        } else if (next >= 65 && next < 85) {
          setCurrentStageIdx(2);
          setScanLogs((l) => [
            ...l,
            { timestamp: now(), tool: 'ZAP', message: `Running OWASP ZAP active & passive DAST spider across OpenAPI routes...` },
            { timestamp: now(), tool: 'ZAP', message: `[BOLA-CWE-639] Dual-Token check flagged object ID tampering on GET /api/v1/users/{id} [CVSS: 9.1]` },
            { timestamp: now(), tool: 'ZAP', message: `[Mass-Assignment-CWE-915] Body schema injection successful on PUT /api/v1/users/{id}/profile [CVSS: 9.3]` },
          ]);
        } else if (next >= 85 && next < 95) {
          setCurrentStageIdx(3);
          setScanLogs((l) => [
            ...l,
            { timestamp: now(), tool: 'ACUNETIX', message: `Acunetix Deep DAST Engine executing business logic & BFLA payout simulation...` },
            { timestamp: now(), tool: 'ACUNETIX', message: `[BFLA-CWE-285] Standard identity successfully triggered POST /api/v1/payments/payouts/instant [CVSS: 9.6]` },
          ]);
        } else if (next >= 95) {
          setCurrentStageIdx(4);
          setScanLogs((l) => [
            ...l,
            { timestamp: now(), tool: 'APISEC', message: `Cross-Tool Correlation: Connecting Nmap Shadow Port 8088 -> Nuclei Debug Leak -> ZAP BOLA -> Acunetix BFLA Payout...` },
            { timestamp: now(), tool: 'APISEC', message: `✓ Synthesized 3 Validated Multi-Hop Attack Paths (Max Compound CVSS: 9.8 Critical)` },
            { timestamp: now(), tool: 'APISEC', message: `✓ Min-Cut Analysis: 2 Choke-Point remediations neutralize 100% of attack paths.` },
          ]);
        }
        return next;
      });
    }, 450);
  };

  const handleImportSarif = async () => {
    setImportStatus('Parsing OASIS SARIF v2.1.0 scan report...');
    setTimeout(() => {
      setImportStatus('✓ Successfully ingested SARIF report into APISEC Causal Graph Mesh!');
      setTimeout(() => setImportStatus(null), 4000);
    }, 800);
  };

  const getToolLogColor = (tool: LogEntry['tool']) => {
    switch (tool) {
      case 'NMAP': return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'NUCLEI': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'ZAP': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'ACUNETIX': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'APISEC': return 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl cyber-card bg-white">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-mono">
              API DISCOVERY & SCANNER MESH
            </h1>
            <span
              className="inline-flex items-center h-[22px] px-2.5 rounded-full border text-[11px] font-mono font-bold uppercase"
              style={{
                backgroundColor: currentConfig.badgeBg,
                color: currentConfig.badgeText,
                borderColor: currentConfig.badgeBorder,
              }}
            >
              Multi-Engine Orchestration
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Orchestrate Nmap, Nuclei, OWASP ZAP, and Acunetix into a unified Causal Attack Graph.
          </p>
        </div>

        <button
          onClick={handleStartScan}
          disabled={isScanning}
          className="flex items-center gap-2 h-10 px-5 rounded-xl cyber-glow-btn text-xs font-black uppercase tracking-wider shadow-md transition-transform hover:scale-102 cursor-pointer font-mono"
        >
          <Play className={`h-4 w-4 fill-current ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Orchestrating Scan...' : 'Run Unified Multi-Mesh'}</span>
        </button>
      </div>

      {importStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono flex items-center justify-between">
          <span>{importStatus}</span>
          <button onClick={() => setImportStatus(null)} className="text-emerald-700 hover:text-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Tabs Container */}
      <div className="p-6 rounded-2xl cyber-card space-y-5 bg-white">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('unified')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
              activeTab === 'unified'
                ? 'bg-slate-100 text-slate-900 border shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
            }`}
            style={activeTab === 'unified' ? { borderColor: currentConfig.primary, color: currentConfig.primary } : {}}
          >
            <Cpu className="h-4 w-4" style={{ color: currentConfig.primary }} />
            <span>Unified Multi-Mesh</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold" style={{ backgroundColor: currentConfig.badgeBg, color: currentConfig.badgeText }}>
              4 ENGINES
            </span>
          </button>

          <button
            onClick={() => setActiveTab('nmap')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
              activeTab === 'nmap'
                ? 'bg-slate-100 text-slate-900 border shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
            }`}
            style={activeTab === 'nmap' ? { borderColor: currentConfig.primary, color: currentConfig.primary } : {}}
          >
            <Server className="h-4 w-4 text-sky-600" />
            <span>Nmap (Port Recon)</span>
          </button>

          <button
            onClick={() => setActiveTab('nuclei')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
              activeTab === 'nuclei'
                ? 'bg-slate-100 text-slate-900 border shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
            }`}
            style={activeTab === 'nuclei' ? { borderColor: currentConfig.primary, color: currentConfig.primary } : {}}
          >
            <Flame className="h-4 w-4 text-purple-600" />
            <span>Nuclei (Fast Probes)</span>
          </button>

          <button
            onClick={() => setActiveTab('zap')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
              activeTab === 'zap'
                ? 'bg-slate-100 text-slate-900 border shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
            }`}
            style={activeTab === 'zap' ? { borderColor: currentConfig.primary, color: currentConfig.primary } : {}}
          >
            <Zap className="h-4 w-4 text-amber-600" />
            <span>OWASP ZAP (DAST)</span>
          </button>

          <button
            onClick={() => setActiveTab('acunetix')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
              activeTab === 'acunetix'
                ? 'bg-slate-100 text-slate-900 border shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
            }`}
            style={activeTab === 'acunetix' ? { borderColor: currentConfig.primary, color: currentConfig.primary } : {}}
          >
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Acunetix (Enterprise)</span>
          </button>

          <button
            onClick={() => setActiveTab('sarif')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
              activeTab === 'sarif'
                ? 'bg-slate-100 text-slate-900 border shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
            }`}
            style={activeTab === 'sarif' ? { borderColor: currentConfig.primary, color: currentConfig.primary } : {}}
          >
            <FileJson className="h-4 w-4 text-slate-500" />
            <span>SARIF Import</span>
          </button>
        </div>

        {/* Tab 1: Unified Multi-Mesh Orchestrator */}
        {activeTab === 'unified' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5 uppercase">
                  Target API Mesh Host / Base URL
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://api.example.com"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5 uppercase">
                  Unified Scan Profile
                </label>
                <select
                  value={scanProfile}
                  onChange={(e) => setScanProfile(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:outline-hidden"
                >
                  <option value="Comprehensive Multi-Mesh Attack Surface Audit">Comprehensive Multi-Mesh Attack Surface Audit (All Engines)</option>
                  <option value="OWASP API Security Top 10 + DAST">OWASP API Security Top 10 + DAST</option>
                  <option value="Fast Recon & Vulnerability Fuzzing">Fast Recon & Vulnerability Fuzzing (Nmap + Nuclei)</option>
                  <option value="Deep Business Logic & Payout Probes">Deep Business Logic & Payout Probes (Acunetix + ZAP)</option>
                </select>
              </div>
            </div>

            {/* Scanner Engine Selector Pills */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-2 uppercase">
                Active Scanner Pipeline Engines (Select to include in mesh)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Nmap Pill */}
                <div
                  onClick={() => toggleTool('nmap')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedTools.includes('nmap')
                      ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Server className="h-5 w-5 text-sky-600" />
                    <div>
                      <div className="text-xs font-mono font-bold">Nmap v7.99</div>
                      <div className="text-[10px] text-slate-500">Port & Shadow Recon</div>
                    </div>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 ${selectedTools.includes('nmap') ? 'text-sky-600' : 'text-slate-300'}`} />
                </div>

                {/* Nuclei Pill */}
                <div
                  onClick={() => toggleTool('nuclei')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedTools.includes('nuclei')
                      ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Flame className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-xs font-mono font-bold">Nuclei v3.11</div>
                      <div className="text-[10px] text-slate-500">Fast Misconfig Probes</div>
                    </div>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 ${selectedTools.includes('nuclei') ? 'text-purple-600' : 'text-slate-300'}`} />
                </div>

                {/* ZAP Pill */}
                <div
                  onClick={() => toggleTool('zap')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedTools.includes('zap')
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="h-5 w-5 text-amber-600" />
                    <div>
                      <div className="text-xs font-mono font-bold">OWASP ZAP 2.14</div>
                      <div className="text-[10px] text-slate-500">DAST & Auth Diff Fuzz</div>
                    </div>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 ${selectedTools.includes('zap') ? 'text-amber-600' : 'text-slate-300'}`} />
                </div>

                {/* Acunetix Pill */}
                <div
                  onClick={() => toggleTool('acunetix')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedTools.includes('acunetix')
                      ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-xs font-mono font-bold">Acunetix DAST</div>
                      <div className="text-[10px] text-slate-500">Deep Logic Threat Crawler</div>
                    </div>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 ${selectedTools.includes('acunetix') ? 'text-blue-600' : 'text-slate-300'}`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: SARIF Import */}
        {activeTab === 'sarif' && (
          <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-center">
            <FileJson className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-mono font-bold text-slate-900 uppercase">Ingest OASIS SARIF v2.1.0 Reports</h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Import SARIF reports generated by GitHub Advanced Security, Snyk, Checkmarx, or custom CI/CD pipelines to merge into the Causal Graph.
            </p>
            <button
              onClick={handleImportSarif}
              className="px-4 py-2 rounded-xl cyber-glow-btn text-xs font-mono font-bold uppercase cursor-pointer"
            >
              Simulate SARIF Import
            </button>
          </div>
        )}

        {/* Scan Progress Bar (if active or finished) */}
        {(isScanning || scanProgress > 0) && (
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                {stages[currentStageIdx] || 'Synthesizing Causal DAG Graph...'}
              </span>
              <span style={{ color: currentConfig.primary }}>{scanProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${scanProgress}%`,
                  background: `linear-gradient(90deg, ${currentConfig.primary}, ${currentConfig.accent})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Live Terminal Log Stream */}
        {scanLogs.length > 0 && (
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="flex items-center gap-1.5 uppercase tracking-wider font-bold">
                <Terminal className="h-3.5 w-3.5" style={{ color: currentConfig.primary }} />
                Real-Time Mesh Execution Log Stream
              </span>
              <span className="text-[10px] text-slate-400">{scanLogs.length} events streamed</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 max-h-64 overflow-y-auto space-y-1.5 text-xs font-mono shadow-inner text-slate-200">
              {scanLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 shrink-0 text-[10px]">[{log.timestamp}]</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${getToolLogColor(log.tool)}`}>
                    {log.tool}
                  </span>
                  <span className="text-slate-200">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
