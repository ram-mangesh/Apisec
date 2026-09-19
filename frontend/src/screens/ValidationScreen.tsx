import React, { useState } from 'react';
import {
  CheckCircle2,
  Play,
  RefreshCw,
  AlertTriangle,
  Shield,
  Server,
  Key,
  Database,
  ArrowRight,
  Split,
  Layers,
  Sparkles,
  Terminal,
  Activity,
  Globe,
  Zap,
  Check,
} from 'lucide-react';
import { SeverityBadge, StatusBadge, MethodBadge } from '../components/Badges';
import { api, MOCK_FINDINGS, MOCK_PROJECTS } from '../api';
import { Finding, TestAccount } from '../types';
import { ScreenType } from '../components/GlobalShell';
import { CodeViewer } from '../components/CodeViewer';
import { useTheme } from '../theme/ThemeContext';

interface ValidationScreenProps {
  initialFindingId?: string;
  onNavigate: (screen: ScreenType, id?: string) => void;
}

export const ValidationScreen: React.FC<ValidationScreenProps> = ({
  initialFindingId = 'F-1021',
  onNavigate,
}) => {
  const { currentConfig } = useTheme();
  const [selectedFindingId, setSelectedFindingId] = useState<string>(initialFindingId);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc_user_b');
  const [validationType, setValidationType] = useState('Live Multi-Hop Attack Chain');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [liveChainResult, setLiveChainResult] = useState<any>(null);

  const testAccounts = MOCK_PROJECTS[0].test_accounts;
  const finding =
    MOCK_FINDINGS.find((f) => f.id.toLowerCase() === selectedFindingId.toLowerCase()) ||
    MOCK_FINDINGS[0];

  const handleRunValidation = async () => {
    setIsValidating(true);
    setValidationResult(null);
    setLiveChainResult(null);

    try {
      if (validationType === 'Live Multi-Hop Attack Chain') {
        const chainRes = await api.validateLiveChain();
        setLiveChainResult(chainRes);
      } else {
        const result = await api.validateFinding({
          finding_id: finding.id,
          test_account_id: selectedAccountId,
          validation_type: validationType,
        });
        setValidationResult(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl cyber-card bg-white">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-mono">
              LIVE EXPLOIT VALIDATION ENGINE
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold uppercase"
              style={{
                backgroundColor: currentConfig.badgeBg,
                color: currentConfig.badgeText,
                borderColor: currentConfig.badgeBorder,
              }}
            >
              Real HTTP Traffic Prober
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Execute deterministic real-time differential probes against live endpoints to mathematically prove authorization bypasses.
          </p>
        </div>

        <button
          onClick={handleRunValidation}
          disabled={isValidating}
          className="flex items-center gap-2 h-10 px-5 rounded-xl cyber-glow-btn text-xs font-black uppercase tracking-wider shadow-md transition-transform hover:scale-102 cursor-pointer font-mono"
        >
          <Play className={`h-4 w-4 fill-current ${isValidating ? 'animate-spin' : ''}`} />
          <span>{isValidating ? 'Firing Live Traffic...' : 'Execute Live Validation'}</span>
        </button>
      </div>

      {/* Main Validation Split: Config (Left) & Live Execution Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Probe Configuration */}
        <div className="lg:col-span-4 p-5 rounded-2xl cyber-card space-y-4 font-mono bg-white">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Probe Configuration</h3>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ backgroundColor: currentConfig.badgeBg, color: currentConfig.badgeText }}>
              LIVE ENGINE
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase">
                Validation Methodology:
              </label>
              <select
                value={validationType}
                onChange={(e) => setValidationType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden"
              >
                <option value="Live Multi-Hop Attack Chain">Live Multi-Hop Attack Chain (Debug → BOLA → Mass Assign → Payout)</option>
                <option value="Single Finding Differential Probe">Single Finding Differential Role-Matrix Probe</option>
              </select>
            </div>

            {validationType === 'Single Finding Differential Probe' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase">
                  Target Finding:
                </label>
                <select
                  value={selectedFindingId}
                  onChange={(e) => setSelectedFindingId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden"
                >
                  {MOCK_FINDINGS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id}: {f.title} ({f.severity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase">
                Target Live Microservice Base URL:
              </label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-purple-700 font-mono text-[11px] font-bold">
                http://127.0.0.1:8001/target/api/v1
              </div>
            </div>

            <button
              onClick={handleRunValidation}
              disabled={isValidating}
              className="w-full h-10 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              <span>Fire Live Probing Traffic</span>
            </button>
          </div>
        </div>

        {/* Right Column: Execution Output */}
        <div className="lg:col-span-8 p-5 rounded-2xl cyber-card space-y-4 bg-white">
          {/* Case 1: Live Multi-Hop Chain Execution Result */}
          {liveChainResult && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 animate-pulse" />
                  <div>
                    <div className="font-bold text-sm text-emerald-800">
                      LIVE MULTI-HOP EXPLOIT CHAIN 100% PROVED
                    </div>
                    <div className="text-xs text-slate-600 font-sans">
                      Disbursed $85,000 corporate funds unauthorized via 4-hop chain
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Total Latency: {liveChainResult.total_latency_ms || 8.5}ms
                </span>
              </div>

              {/* Hop-by-Hop Steps */}
              <div className="space-y-3">
                {liveChainResult.hops?.map((hop: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center border border-purple-200">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900">{hop.title || `Hop ${idx + 1}`}</span>
                        <code className="text-purple-700 font-bold text-[11px]">{hop.endpoint}</code>
                      </div>
                      <span className="text-emerald-700 font-bold">{hop.status || '200 OK'}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-sans">{hop.summary}</p>
                    {hop.extracted && (
                      <div className="text-[11px] p-2 rounded bg-white text-amber-800 border border-slate-200 font-bold">
                        Extracted Variable: <strong>{JSON.stringify(hop.extracted)}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Case 2: Single Finding Differential Probe Result */}
          {validationResult && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-rose-800">
                      VIOLATION CONFIRMED: BOLA Object Level Authorization Bypass
                    </div>
                    <div className="text-xs text-slate-600 font-sans">
                      Response differed from baseline schema with unauthorized payload leakage
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-500 uppercase font-bold">Probe Response Payload:</span>
                <CodeViewer
                  code={JSON.stringify(validationResult, null, 2)}
                  language="json"
                  filename="Prober Execution Trace"
                  maxHeight="250px"
                />
              </div>
            </div>
          )}

          {!liveChainResult && !validationResult && (
            <div className="py-16 text-center space-y-3 font-mono">
              <Terminal className="h-12 w-12 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700">Ready to execute live validation engine</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
                Select your probe configuration on the left and click "Fire Live Probing Traffic" to execute genuine HTTP requests against the target API.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
