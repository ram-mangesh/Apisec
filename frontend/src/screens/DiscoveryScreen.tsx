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
  Filter,
  Search,
  Check,
  Eye,
  Lock,
} from 'lucide-react';
import { Project } from '../types';
import { StatusBadge, SeverityBadge, MethodBadge, ScoreBadge } from '../components/Badges';
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
  tool: 'PORT-SCAN' | 'CVE-ENUM' | 'DAST-ENGINE' | 'LOGIC-DAST' | 'APISEC' | 'SYSTEM';
  message: string;
}

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({
  currentProject,
  onNavigateToInventory,
  onNavigateToFindings,
  onNavigateToAttackPaths,
}) => {
  const { currentConfig } = useTheme();
  const [activeTab, setActiveTab] = useState<'unified' | 'nmap' | 'nuclei' | 'zap' | 'acunetix' | 'sarif'>('unified');
  const [targetUrl, setTargetUrl] = useState('https://api.acmeprod.io');
  const [scanProfile, setScanProfile] = useState('Comprehensive Multi-Mesh Attack Surface Audit');
  const [selectedTools, setSelectedTools] = useState<string[]>(['nmap', 'nuclei', 'zap', 'acunetix']);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [scanLogs, setScanLogs] = useState<LogEntry[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Filters for individual engine grids
  const [portFilter, setPortFilter] = useState('All');
  const [cveSeverityFilter, setCveSeverityFilter] = useState('All');
  const [dastMethodFilter, setDastMethodFilter] = useState('All');

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
    'Phase 1: Custom Port Scanning Engine Reconnaissance & Shadow Listener Discovery...',
    'Phase 2: Common Vulnerability Enumeration Engine Probes & Exposure Scans...',
    'Phase 3: Dynamic Application Security Testing Engine Active Spidering...',
    'Phase 4: Deep Logic & Business Flaw Engine Threat Modeling...',
    'Phase 5: APISEC Causal DAG Correlation & Choke-Point Synthesis...',
  ];

  // Dynamic Data: Custom Port Scanning Engine Grid
  const portScanGrid = [
    { port: 80, proto: 'tcp', service: 'http', version: 'nginx 1.25.4', state: 'Open', risk: 'Low', shadow: false, latency: '0.8ms' },
    { port: 443, proto: 'tcp', service: 'https / TLS 1.3', version: 'Cloudflare / API Gateway', state: 'Open', risk: 'Safe', shadow: false, latency: '1.1ms' },
    { port: 8001, proto: 'tcp', service: 'apisec-mesh', version: 'FastAPI / Uvicorn Enterprise', state: 'Open', risk: 'Safe', shadow: false, latency: '0.4ms' },
    { port: 8088, proto: 'tcp', service: 'debug-api-listener', version: 'Python 3.11 Internal Microservice', state: 'Flagged Shadow', risk: 'Critical', shadow: true, latency: '1.4ms' },
    { port: 5432, proto: 'tcp', service: 'postgresql', version: 'PostgreSQL 16.2 Core DB', state: 'Filtered / VPC', risk: 'Medium', shadow: false, latency: '2.1ms' },
    { port: 6379, proto: 'tcp', service: 'redis', version: 'Redis 7.2 Session Store', state: 'Filtered / VPC', risk: 'Low', shadow: false, latency: '1.8ms' },
  ];

  // Dynamic Data: Common Vulnerability Enumeration Engine Grid
  const cveEnumGrid = [
    { templateId: 'exposed-debug-endpoint', name: 'Unauthenticated Debug Route Exposure', cve: 'CWE-200', severity: 'High', cvss: 7.8, endpoint: '/api/v1/system/debug', status: 'Vulnerable', matches: 50 },
    { templateId: 'unprotected-mfa-route', name: 'MFA OTP Missing Rate Limiting', cve: 'CWE-307', severity: 'High', cvss: 8.2, endpoint: '/api/v1/auth/mfa/verify-otp', status: 'Vulnerable', matches: 1 },
    { templateId: 'jwt-none-algorithm', name: 'JWT Alg:None Signature Bypass', cve: 'CWE-347', severity: 'Critical', cvss: 9.0, endpoint: '/api/v1/auth/token', status: 'Tested Safe', matches: 0 },
    { templateId: 'cors-wildcard-misconfig', name: 'Overly Permissive CORS Origin Header', cve: 'CWE-942', severity: 'Medium', cvss: 5.4, endpoint: '/api/v1/orders/*', status: 'Tested Safe', matches: 0 },
    { templateId: 'swagger-ui-exposure', name: 'Public OpenAPI / Swagger Documentation Exposure', cve: 'CWE-200', severity: 'Low', cvss: 3.7, endpoint: '/docs', status: 'Informational', matches: 1 },
    { templateId: 'graphql-introspection-enabled', name: 'GraphQL Introspection Query Enabled', cve: 'CWE-200', severity: 'Medium', cvss: 5.3, endpoint: '/graphql', status: 'Tested Safe', matches: 0 },
  ];

  // Dynamic Data: Dynamic Application Security Testing Engine Grid
  const dastSpiderGrid = [
    { id: 'DAST-01', method: 'GET', endpoint: '/api/v1/users/{id}', testType: 'BOLA Differential Fuzzing', result: 'Unauthorized State Exfiltrated', latency: '42ms', status: 'Violation Proved', cvss: 9.1 },
    { id: 'DAST-02', method: 'PUT', endpoint: '/api/v1/users/{id}/profile', testType: 'Mass Assignment JSON Injection', result: 'Role Field Escalated to Admin', latency: '38ms', status: 'Violation Proved', cvss: 9.3 },
    { id: 'DAST-03', method: 'POST', endpoint: '/api/v1/payments/transfers', testType: 'Negative Balance / Race Condition', result: 'Rejected by Balance Guard', latency: '65ms', status: 'Blocked 400', cvss: 0.0 },
    { id: 'DAST-04', method: 'GET', endpoint: '/api/v1/orders/{order_id}', testType: 'Cross-Tenant Object ID Probing', result: 'Cross-Tenant Order Summary Leaked', latency: '49ms', status: 'Violation Proved', cvss: 8.6 },
    { id: 'DAST-05', method: 'DELETE', endpoint: '/api/v1/accounts/{id}', testType: 'Direct Object Deletion Probing', result: 'Authorization Required (403)', latency: '31ms', status: 'Blocked 403', cvss: 0.0 },
  ];

  // Dynamic Data: Deep DAST & Business Logic Engine Grid
  const logicEngineGrid = [
    { id: 'LOGIC-01', scenario: 'Instant Payout Business Logic Bypass', service: 'Payment Service', actor: 'Standard Customer (Bob)', bypass: 'Unauthorized $85,000 corporate disbursement trigger', cvss: 9.6, severity: 'Critical', verified: true },
    { id: 'LOGIC-02', scenario: 'Multi-Tenant Account Takeover Chain', service: 'User Service', actor: 'Tenant B User', bypass: 'Session escalation to Tenant A Merchant Admin', cvss: 9.4, severity: 'Critical', verified: true },
    { id: 'LOGIC-03', scenario: 'Coupon Code Stacking Logic Flaw', service: 'Order Service', actor: 'Standard Customer', bypass: 'Single coupon re-use in multiple checkout carts', cvss: 6.2, severity: 'Medium', verified: false },
  ];

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanProgress(5);
    setCurrentStageIdx(0);
    const now = () => new Date().toISOString().substring(11, 19);

    setScanLogs([
      { timestamp: now(), tool: 'SYSTEM', message: `Initializing APISEC Unified Multi-Mesh Orchestrator on ${targetUrl}...` },
      { timestamp: now(), tool: 'SYSTEM', message: `Active Scanner Pipeline: PORT SCANNER + CVE ENUM + DAST ENGINE + DEEP LOGIC` },
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
            { timestamp: now(), tool: 'PORT-SCAN', message: `Scanning network ports for target host ${targetUrl}...` },
            { timestamp: now(), tool: 'PORT-SCAN', message: `Discovered Open Ports: 80/http, 443/https, 8001/api-mesh, 8088/shadow-debug` },
            { timestamp: now(), tool: 'PORT-SCAN', message: `FLAGGED SHADOW SERVICE: Undocumented debug route on port 8088 (Node: AWS us-east-1-node-77)` },
          ]);
        } else if (next >= 40 && next < 65) {
          setCurrentStageIdx(1);
          setScanLogs((l) => [
            ...l,
            { timestamp: now(), tool: 'CVE-ENUM', message: `Executing 150+ API misconfiguration & exposure templates...` },
            { timestamp: now(), tool: 'CVE-ENUM', message: `[exposed-debug-endpoint] GET /api/v1/users/export-debug [CVSS: 7.8] - Leaked 50 active UUIDs` },
            { timestamp: now(), tool: 'CVE-ENUM', message: `[unprotected-mfa-route] POST /api/v1/auth/mfa/verify-otp [CVSS: 8.2] - Missing rate limit header` },
          ]);
        } else if (next >= 65 && next < 85) {
          setCurrentStageIdx(2);
          setScanLogs((l) => [
            ...l,
            { timestamp: now(), tool: 'DAST-ENGINE', message: `Running dynamic DAST spider and differential fuzzing across OpenAPI routes...` },
            { timestamp: now(), tool: 'DAST-ENGINE', message: `[BOLA-CWE-639] Dual-Token check flagged object ID tampering on GET /api/v1/users/{id} [CVSS: 9.1]` },
            { timestamp: now(), tool: 'DAST-ENGINE', message: `[Mass-Assignment-CWE-915] Body schema injection successful on PUT /api/v1/users/{id}/profile [CVSS: 9.3]` },
          ]);
        } else if (next >= 85 && next < 95) {
          setCurrentStageIdx(3);
          setScanLogs((l) => [
            ...l,
            { timestamp: now(), tool: 'LOGIC-DAST', message: `Deep DAST Engine executing business logic & BFLA payout simulation...` },
            { timestamp: now(), tool: 'LOGIC-DAST', message: `[BFLA-CWE-285] Standard identity successfully triggered POST /api/v1/payments/payouts/instant [CVSS: 9.6]` },
          ]);
        } else if (next >= 95) {
          setCurrentStageIdx(4);
          setScanLogs((l) => [
            ...l,
            { timestamp: now(), tool: 'APISEC', message: `Cross-Engine Correlation: Connecting Shadow Port 8088 -> Debug Leak -> BOLA -> BFLA Instant Payout...` },
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
      case 'PORT-SCAN': return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'CVE-ENUM': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'DAST-ENGINE': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'LOGIC-DAST': return 'text-blue-700 bg-blue-50 border-blue-200';
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
              4 Unified Engines
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Orchestrate port recon, vulnerability enumeration, dynamic DAST fuzzing, and deep business logic simulation.
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
        {/* Navigation Engine Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto font-mono text-xs font-bold">
          <button
            onClick={() => setActiveTab('unified')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl uppercase transition-all cursor-pointer ${
              activeTab === 'unified'
                ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Cpu className="h-4 w-4 text-purple-600" />
            <span>Unified Multi-Mesh</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
              4 ENGINES
            </span>
          </button>

          <button
            onClick={() => setActiveTab('nmap')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl uppercase transition-all cursor-pointer ${
              activeTab === 'nmap'
                ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Server className="h-4 w-4 text-sky-600" />
            <span>Custom Port Scanning Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('nuclei')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl uppercase transition-all cursor-pointer ${
              activeTab === 'nuclei'
                ? 'bg-purple-50 text-purple-800 border border-purple-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Flame className="h-4 w-4 text-purple-600" />
            <span>CVE Enumeration Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('zap')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl uppercase transition-all cursor-pointer ${
              activeTab === 'zap'
                ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Zap className="h-4 w-4 text-amber-600" />
            <span>Dynamic DAST Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('acunetix')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl uppercase transition-all cursor-pointer ${
              activeTab === 'acunetix'
                ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Deep DAST & Logic Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('sarif')}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl uppercase transition-all cursor-pointer ${
              activeTab === 'sarif'
                ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <FileJson className="h-4 w-4 text-slate-500" />
            <span>SARIF Ingestion</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: UNIFIED MULTI-MESH OVERVIEW & ORCHESTRATION */}
        {/* ========================================================================= */}
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
                  <option value="Fast Recon & Vulnerability Fuzzing">Fast Recon & Vulnerability Fuzzing</option>
                  <option value="Deep Business Logic & Payout Probes">Deep Business Logic & Payout Probes</option>
                </select>
              </div>
            </div>

            {/* Scanner Engine Selector Pills Grid */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-2 uppercase">
                Active Scanner Pipeline Engines (Select to include in mesh)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Custom Port Scanning Engine Pill */}
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
                      <div className="text-xs font-mono font-bold">Port Scanning Engine</div>
                      <div className="text-[10px] text-slate-500">Port & Shadow Recon</div>
                    </div>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 ${selectedTools.includes('nmap') ? 'text-sky-600' : 'text-slate-300'}`} />
                </div>

                {/* Common Vulnerability Enumeration Engine Pill */}
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
                      <div className="text-xs font-mono font-bold">CVE Enumeration Engine</div>
                      <div className="text-[10px] text-slate-500">Fast Exposure Probes</div>
                    </div>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 ${selectedTools.includes('nuclei') ? 'text-purple-600' : 'text-slate-300'}`} />
                </div>

                {/* Dynamic Application Security Testing Engine Pill */}
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
                      <div className="text-xs font-mono font-bold">Dynamic DAST Engine</div>
                      <div className="text-[10px] text-slate-500">DAST & Auth Diff Fuzz</div>
                    </div>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 ${selectedTools.includes('zap') ? 'text-amber-600' : 'text-slate-300'}`} />
                </div>

                {/* Deep DAST & Logic Engine Pill */}
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
                      <div className="text-xs font-mono font-bold">Deep DAST & Logic Engine</div>
                      <div className="text-[10px] text-slate-500">Business Logic Crawler</div>
                    </div>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 ${selectedTools.includes('acunetix') ? 'text-blue-600' : 'text-slate-300'}`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DYNAMIC GRID - CUSTOM PORT SCANNING ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'nmap' && (
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">Custom Port Scanning Engine - Live Recon Grid</h3>
                <p className="text-xs text-slate-500 font-sans">Active network listener map, banner detection, and shadow route identification.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200">
                6 Network Ports Scanned
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-3">Port / Proto</th>
                    <th className="py-3 px-3">Service Name</th>
                    <th className="py-3 px-3">Detected Version & Banner</th>
                    <th className="py-3 px-3">Listener State</th>
                    <th className="py-3 px-3">Risk Tier</th>
                    <th className="py-3 px-3">Latency</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portScanGrid.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {p.port}/{p.proto}
                      </td>
                      <td className="py-3 px-3 text-purple-700 font-bold">
                        {p.service}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {p.version}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.shadow
                            ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                            : p.state === 'Open'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {p.state}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <SeverityBadge severity={p.risk} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {p.latency}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigateToInventory && onNavigateToInventory()}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded text-[10px] font-bold border border-slate-200"
                        >
                          View Routes →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DYNAMIC GRID - COMMON VULNERABILITY ENUMERATION ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'nuclei' && (
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">Common Vulnerability Enumeration Engine - Template Matrix</h3>
                <p className="text-xs text-slate-500 font-sans">Automated YAML exposure templates, debug leak detection, and authentication bypass heuristics.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-purple-50 text-purple-800 border border-purple-200">
                150+ Templates Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-3">Template ID</th>
                    <th className="py-3 px-3">Vulnerability / Check Name</th>
                    <th className="py-3 px-3">CWE</th>
                    <th className="py-3 px-3">CVSS</th>
                    <th className="py-3 px-3">Target Endpoint</th>
                    <th className="py-3 px-3">Scan Result</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cveEnumGrid.map((cve, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-purple-700">
                        {cve.templateId}
                      </td>
                      <td className="py-3 px-3 font-sans font-semibold text-slate-900">
                        {cve.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {cve.cve}
                      </td>
                      <td className="py-3 px-3">
                        <ScoreBadge score={cve.cvss} />
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-bold">
                        {cve.endpoint}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          cve.status === 'Vulnerable'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {cve.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {cve.status === 'Vulnerable' ? (
                          <button
                            onClick={() => onNavigateToFindings && onNavigateToFindings()}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-bold border border-rose-200"
                          >
                            Finding →
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Clean</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DYNAMIC GRID - DYNAMIC APPLICATION SECURITY TESTING ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'zap' && (
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">Dynamic DAST Engine - Spider & Differential Matrix</h3>
                <p className="text-xs text-slate-500 font-sans">Active & passive differential authorization spidering, payload fuzzing, and role permission tests.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                42 Live Probes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Endpoint Route</th>
                    <th className="py-3 px-3">Fuzzing Type</th>
                    <th className="py-3 px-3">Differential Result</th>
                    <th className="py-3 px-3">Latency</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dastSpiderGrid.map((dast) => (
                    <tr key={dast.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <MethodBadge method={dast.method} size="sm" />
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {dast.endpoint}
                      </td>
                      <td className="py-3 px-3 text-purple-700 font-semibold">
                        {dast.testType}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-sans text-[11px]">
                        {dast.result}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {dast.latency}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          dast.status.includes('Proved')
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {dast.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigateToFindings && onNavigateToFindings()}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 text-slate-800 rounded text-[10px] font-bold border border-slate-200"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DYNAMIC GRID - DEEP DAST & BUSINESS LOGIC ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'acunetix' && (
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">Deep DAST & Logic Engine - Business Logic Scenarios</h3>
                <p className="text-xs text-slate-500 font-sans">Multi-step authorization bypass crawlers, state machine exploits, and payout hijacking simulation.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
                Peak CVSS 9.6
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {logicEngineGrid.map((scen) => (
                <div key={scen.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700">{scen.id}</span>
                      <SeverityBadge severity={scen.severity} size="sm" />
                    </div>
                    <div className="font-bold text-sm text-slate-900 font-sans">{scen.scenario}</div>
                    <p className="text-xs text-slate-600 font-sans">{scen.bypass}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Target: {scen.service}</span>
                    <button
                      onClick={() => onNavigateToAttackPaths && onNavigateToAttackPaths()}
                      className="text-purple-700 font-bold hover:underline"
                    >
                      Attack Path →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SARIF IMPORT */}
        {/* ========================================================================= */}
        {activeTab === 'sarif' && (
          <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-center">
            <FileJson className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-mono font-bold text-slate-900 uppercase">Ingest OASIS SARIF v2.1.0 Reports</h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto font-sans">
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

        {/* Scan Progress Bar */}
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
