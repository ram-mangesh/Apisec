import React, { useState } from 'react';
import {
  Split,
  AlertTriangle,
  CheckCircle2,
  Key,
  Database,
  ArrowRight,
  ShieldAlert,
  Server,
  FileCode,
  Layers,
  Sparkles,
  Play,
  ArrowLeftRight,
  Shield,
} from 'lucide-react';
import { CodeViewer } from '../components/CodeViewer';
import { MOCK_EVIDENCES, MOCK_FINDINGS } from '../api';
import { Evidence } from '../types';
import { ScreenType } from '../components/GlobalShell';
import { useTheme } from '../theme/ThemeContext';

interface EvidenceScreenProps {
  findingId?: string;
  onNavigate: (screen: ScreenType, id?: string) => void;
}

export const EvidenceScreen: React.FC<EvidenceScreenProps> = ({
  findingId = 'F-1021',
  onNavigate,
}) => {
  const { currentConfig } = useTheme();
  const [selectedFindingId, setSelectedFindingId] = useState<string>(findingId);

  const evidence: Evidence =
    MOCK_EVIDENCES[selectedFindingId] ||
    Object.values(MOCK_EVIDENCES).find(
      (e) => e.finding_id.toLowerCase() === selectedFindingId.toLowerCase()
    ) ||
    MOCK_EVIDENCES['ev-1021'];

  const finding = MOCK_FINDINGS.find((f) => f.id === evidence.finding_id) || MOCK_FINDINGS[0];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header & Evidence Switcher */}
      <div className="p-6 rounded-2xl cyber-card bg-white space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border uppercase"
                style={{
                  backgroundColor: currentConfig.badgeBg,
                  color: currentConfig.badgeText,
                  borderColor: currentConfig.badgeBorder,
                }}
              >
                {evidence.id}
              </span>
              <h1 className="text-xl font-bold text-slate-900 font-sans truncate">
                Differential Evidence Diff
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-semibold border border-slate-200">
                Finding: {evidence.finding_id}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-sans">
              Side-by-side comparative execution of legitimate baseline request against unauthorized probe payload.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 font-mono">
            <select
              value={evidence.id}
              onChange={(e) => {
                const ev = MOCK_EVIDENCES[e.target.value];
                if (ev) setSelectedFindingId(ev.finding_id);
              }}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-medium focus:outline-hidden"
            >
              {Object.values(MOCK_EVIDENCES).map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.finding_id}: {ev.title.slice(0, 36)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* "Response Differs Significantly" Critical Proof Banner */}
      <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-rose-950 font-mono flex items-center gap-2">
                <span>DIFFERENTIAL VIOLATION CONFIRMED: Unauthorized State Access</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-black uppercase shadow-xs">
                  Zero False Positive
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 font-sans">
                {evidence.diff_summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 font-mono">
            <button
              onClick={() => onNavigate('findings', finding.id)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-transform hover:scale-102 cursor-pointer shadow-xs"
            >
              View Remediation Patch
            </button>
          </div>
        </div>

        {/* Extracted Variables Grid */}
        <div className="pt-3 border-t border-rose-200/80">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-900 block mb-2">
            Dynamically Extracted Differential Proof Variables:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {Object.entries(evidence.extracted_variables).map(([key, val]) => (
              <div
                key={key}
                className="p-2.5 rounded-xl bg-white border border-rose-200 text-slate-800 shadow-xs"
              >
                <div className="text-[10px] text-slate-500 truncate">{key}</div>
                <div className="font-bold text-purple-700 truncate">{String(val)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Side-by-Side HTTP Diff View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Baseline Request & Response */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-xs" />
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">Baseline (Legitimate Request)</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 font-medium">
              Identity: Legitimate Tenant A
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-mono text-slate-600 block mb-1 font-semibold">
                Baseline HTTP Request
              </span>
              <CodeViewer
                code={evidence.baseline_request}
                language="http"
                filename="Baseline Request"
                maxHeight="220px"
              />
            </div>

            <div>
              <span className="text-xs font-mono text-slate-600 block mb-1 font-semibold">
                Baseline HTTP Response (200 OK)
              </span>
              <CodeViewer
                code={evidence.baseline_response}
                language="http"
                filename="Baseline Response"
                maxHeight="220px"
              />
            </div>
          </div>
        </div>

        {/* Column 2: Probe Request & Response */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600 shadow-xs animate-pulse" />
              <h3 className="text-sm font-bold text-rose-900 font-mono uppercase">
                Differential Probe (Attacker Attempt)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-rose-700">
              Identity: Unauthorized Tenant B (Bob)
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-mono text-slate-600 block mb-1 font-semibold">
                Probe HTTP Request (Cross-Tenant Key)
              </span>
              <CodeViewer
                code={evidence.probe_request}
                language="http"
                filename="Probe Request (Tampered Object Key)"
                maxHeight="220px"
              />
            </div>

            <div>
              <span className="text-xs font-mono text-slate-600 block mb-1 font-semibold">
                Probe HTTP Response (Leakage Confirmed)
              </span>
              <CodeViewer
                code={evidence.probe_response}
                language="http"
                filename="Probe Response (200 OK + PII Leak)"
                maxHeight="220px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
