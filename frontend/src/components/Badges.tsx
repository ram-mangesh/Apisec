import React from 'react';
import { Severity, HttpMethod, FindingStatus, RiskLevel } from '../types';

interface SeverityBadgeProps {
  severity: Severity | RiskLevel | string;
  size?: 'sm' | 'md' | 'lg' | string;
  showDot?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showDot = true,
}) => {
  const norm = (severity || 'Info').toLowerCase();

  let styles = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  let dotColor = 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]';

  if (norm === 'critical') {
    styles = 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]';
    dotColor = 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.9)]';
  } else if (norm === 'high') {
    styles = 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
    dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]';
  } else if (norm === 'medium') {
    styles = 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40';
    dotColor = 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]';
  } else if (norm === 'low' || norm === 'safe') {
    styles = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    dotColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
  }

  return (
    <span
      className={`inline-flex items-center h-[22px] px-2.5 rounded-full border text-[11px] font-semibold tracking-tight shrink-0 select-none gap-1.5 backdrop-blur-md ${styles}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />}
      {severity}
    </span>
  );
};

interface MethodBadgeProps {
  method: HttpMethod | string;
  size?: 'sm' | 'md' | 'lg' | string;
}

export const MethodBadge: React.FC<MethodBadgeProps> = ({ method }) => {
  const m = (method || 'GET').toUpperCase();

  let styles = 'bg-slate-800/80 text-slate-300 border-slate-700';

  if (m === 'GET') {
    styles = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
  } else if (m === 'POST') {
    styles = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (m === 'PUT') {
    styles = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else if (m === 'PATCH') {
    styles = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  } else if (m === 'DELETE') {
    styles = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  } else if (m === 'OPTIONS' || m === 'HEAD') {
    styles = 'bg-slate-800 text-slate-400 border-slate-700';
  }

  return (
    <span className={`inline-flex items-center justify-center h-[20px] px-1.5 font-mono text-[10px] font-bold rounded-[4px] border uppercase tracking-wider shrink-0 select-none ${styles}`}>
      {m}
    </span>
  );
};

interface StatusBadgeProps {
  status: FindingStatus | string;
  size?: 'sm' | 'md' | 'lg' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = (status || 'Open').toLowerCase();

  let styles = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  if (s === 'validated' || s === 'closed' || s === 'remediated') {
    styles = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    dotColor = 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]';
  } else if (s === 'validating' || s === 'in progress') {
    styles = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]';
  } else if (s === 'open' || s === 'active') {
    styles = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    dotColor = 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]';
  } else if (s === 'false positive') {
    styles = 'bg-slate-800 text-slate-400 border-slate-700';
    dotColor = 'bg-slate-400';
  }

  return (
    <span className={`inline-flex items-center h-[22px] px-2 rounded-full border text-[11px] font-medium shrink-0 select-none gap-1.5 backdrop-blur-md ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
      {status}
    </span>
  );
};

export const ScoreBadge: React.FC<{ score: number; max?: number }> = ({ score, max = 10 }) => {
  let color = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (score >= 9.0) {
    color = 'text-rose-400 border-rose-500/40 bg-rose-500/15 shadow-[0_0_10px_rgba(244,63,94,0.25)]';
  } else if (score >= 7.0) {
    color = 'text-amber-400 border-amber-500/40 bg-amber-500/15 shadow-[0_0_10px_rgba(245,158,11,0.25)]';
  } else if (score >= 4.0) {
    color = 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
  }

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-[4px] border ${color}`}>
      <span>{score.toFixed(1)}</span>
      <span className="text-[10px] opacity-70">/{max}</span>
    </span>
  );
};

export const TagBadge: React.FC<{ label: string; variant?: string }> = ({ label }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-cyan-300 border border-white/10">
      {label}
    </span>
  );
};
