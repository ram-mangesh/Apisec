import React, { useState } from 'react';
import {
  GitFork,
  AlertTriangle,
  Server,
  Database,
  Lock,
  Globe,
  User,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
  ChevronRight,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';
import { SeverityBadge } from '../components/Badges';
import { MOCK_ATTACK_PATHS } from '../api';
import { AttackPath, GraphNode } from '../types';
import { ScreenType } from '../components/GlobalShell';
import { useTheme } from '../theme/ThemeContext';

interface AttackPathGraphScreenProps {
  pathId?: string;
  onNavigate: (screen: ScreenType, id?: string) => void;
}

export const AttackPathGraphScreen: React.FC<AttackPathGraphScreenProps> = ({
  pathId = 'AP-001',
  onNavigate,
}) => {
  const { currentConfig } = useTheme();
  const [selectedPathId, setSelectedPathId] = useState<string>(pathId);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const currentPath: AttackPath =
    MOCK_ATTACK_PATHS.find((ap) => ap.id.toLowerCase() === selectedPathId.toLowerCase()) ||
    MOCK_ATTACK_PATHS[0];

  const selectedNode = currentPath.graph_nodes.find((n) => n.id === selectedNodeId);

  const getNodeIcon = (type: GraphNode['type']) => {
    switch (type) {
      case 'entry':
        return <Globe className="h-4 w-4 text-slate-500" />;
      case 'endpoint':
        return <Server className="h-4 w-4 text-sky-600" />;
      case 'finding':
        return <AlertTriangle className="h-4 w-4 text-rose-600" />;
      case 'identity':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'boundary':
        return <Lock className="h-4 w-4 text-amber-600" />;
      case 'asset':
        return <Database className="h-4 w-4 text-emerald-600" />;
      default:
        return <GitFork className="h-4 w-4 text-slate-500" />;
    }
  };

  const getNodeStyle = (type: GraphNode['type'], isSelected: boolean) => {
    if (isSelected) {
      return 'bg-purple-50 border-purple-500 ring-2 ring-purple-200 shadow-sm';
    }
    switch (type) {
      case 'entry':
        return 'bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-900';
      case 'endpoint':
        return 'bg-sky-50 border-sky-200 hover:border-sky-400 text-sky-950';
      case 'finding':
        return 'bg-rose-50 border-rose-200 hover:border-rose-400 text-rose-950';
      case 'identity':
        return 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-950';
      case 'boundary':
        return 'bg-amber-50 border-amber-200 hover:border-amber-400 text-amber-950';
      case 'asset':
        return 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 text-emerald-950';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Top Header & Attack Path Selector */}
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
                {currentPath.id}
              </span>
              <h1 className="text-xl font-bold text-slate-900 font-sans truncate">
                {currentPath.title}
              </h1>
              <SeverityBadge severity={currentPath.risk_level} />
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold text-xs">
                Compound CVSS {currentPath.compound_cvss}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-sans">
              Visual graph correlation of multi-hop authorization bypass chains and min-cut choke points.
            </p>
          </div>

          {/* Path Switcher */}
          <div className="flex items-center gap-2 shrink-0 font-mono">
            <select
              value={selectedPathId}
              onChange={(e) => {
                setSelectedPathId(e.target.value);
                setSelectedNodeId(null);
              }}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-medium focus:outline-hidden"
            >
              {MOCK_ATTACK_PATHS.map((path) => (
                <option key={path.id} value={path.id}>
                  {path.id}: {path.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Choke Point Remediation Highlight Banner */}
      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Critical Remediation Choke Point (Min-Cut Analysis)</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
              {currentPath.choke_point}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {currentPath.remediation_summary}
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('copilot')}
          className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider shrink-0 shadow-xs transition-transform hover:scale-102 cursor-pointer font-mono"
        >
          Generate Patch in Copilot
        </button>
      </div>

      {/* Main Split: Visual Graph (Left) & Steps Detail Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Graph Canvas (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl cyber-card space-y-4 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-mono">
              <GitFork className="h-4 w-4" style={{ color: currentConfig.primary }} />
              <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Exploitation Topology Graph
              </span>
              <span className="text-xs text-slate-400">
                ({currentPath.graph_nodes.length} Nodes • {currentPath.graph_edges.length} Transitions)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Click node to inspect</span>
          </div>

          {/* Topology Node Grid Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 py-2">
            {currentPath.graph_nodes.map((node, idx) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`min-h-[75px] rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${getNodeStyle(
                    node.type,
                    isSelected
                  )}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getNodeIcon(node.type)}
                      <span className="text-xs font-bold truncate leading-tight text-slate-900">
                        {node.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0 font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-black/5 text-[11px] font-mono">
                    <span className="capitalize text-slate-500 font-semibold">{node.type}</span>
                    {node.data?.is_choke_point && (
                      <span className="text-[9px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                        CHOKE POINT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Node Details Drawer (if clicked) */}
          {selectedNode && (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs font-mono space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-purple-900 font-bold border-b border-purple-200 pb-1.5">
                <span>INSPECTING NODE: {selectedNode.label}</span>
                <span className="uppercase text-purple-600">{selectedNode.type}</span>
              </div>
              <p className="text-slate-700 font-sans">{selectedNode.data?.description || 'Active execution payload hop in the causal chain.'}</p>
              {selectedNode.data?.finding_id && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-600">Linked Vulnerability:</span>
                  <button
                    onClick={() => onNavigate('findings', selectedNode.data.finding_id)}
                    className="text-purple-700 underline font-bold"
                  >
                    {selectedNode.data.finding_id} →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Graph Legend */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 text-xs font-mono text-slate-500">
            <span className="font-bold text-slate-800 uppercase tracking-wider">Legend:</span>
            <div className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-slate-500" /> Entry</div>
            <div className="flex items-center gap-1.5"><Server className="h-3.5 w-3.5 text-sky-600" /> Endpoint</div>
            <div className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Finding</div>
            <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-purple-600" /> Identity</div>
            <div className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-amber-600" /> Boundary</div>
            <div className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-emerald-600" /> Asset</div>
          </div>
        </div>

        {/* Right Panel: Attack Steps Walkthrough (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl cyber-card space-y-4 bg-white">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between font-mono">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Chained Exploit Steps ({currentPath.steps.length})
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% PROVED
            </span>
          </div>

          {/* Step Timeline */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {currentPath.steps.map((step) => (
              <div
                key={step.step_num}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 hover:border-purple-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-5 w-5 rounded-full text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: currentConfig.primary }}
                    >
                      {step.step_num}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {step.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {step.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  {step.description}
                </p>
                {step.finding_id && (
                  <div className="pt-1 flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold" style={{ color: currentConfig.primary }}>
                      Linked: {step.finding_id}
                    </span>
                    <button
                      onClick={() => onNavigate('findings', step.finding_id)}
                      className="hover:underline font-bold"
                      style={{ color: currentConfig.primary }}
                    >
                      Finding details →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('validation')}
            className="w-full h-10 cyber-glow-btn rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-102 cursor-pointer font-mono"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Replay Differential Validation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
