import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Shield,
  FileCode,
  Share2,
  Printer,
  Calendar,
  Layers,
  ArrowRight,
  Check,
} from 'lucide-react';
import { SeverityBadge, StatusBadge, ScoreBadge } from '../components/Badges';
import { MOCK_FINDINGS, MOCK_ATTACK_PATHS, MOCK_PROJECTS } from '../api';
import { Project } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface ReportsScreenProps {
  currentProject: Project;
  onNavigateToFinding?: (id: string) => void;
  onNavigateToPath?: (id: string) => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  currentProject,
  onNavigateToFinding,
  onNavigateToPath,
}) => {
  const { currentConfig } = useTheme();
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'sarif' | 'csv' | null>(null);

  const handleDownload = (format: 'pdf' | 'sarif' | 'csv') => {
    setDownloading(true);
    setDownloadFormat(format);
    setTimeout(() => {
      setDownloading(false);
      setDownloadFormat(null);
      const element = document.createElement('a');
      const file = new Blob([`APISEC Security Audit Report - ${currentProject.name}\nGenerated: 2026-09-18\nFindings: 7\nStatus: 100% Proved`], {
        type: 'text/plain',
      });
      element.href = URL.createObjectURL(file);
      element.download = `APISEC_Audit_Report_${currentProject.id}.${format === 'sarif' ? 'sarif' : format === 'csv' ? 'csv' : 'txt'}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 800);
  };

  const owaspMapping = [
    {
      category: 'API1:2023 Broken Object Level Authorization',
      finding: 'F-1021: BOLA on User Profile Data',
      severity: 'Critical',
      cvss: 9.1,
      status: 'Proved',
    },
    {
      category: 'API2:2023 Broken Authentication / Rate Limit',
      finding: 'F-1024: Missing Rate Limiting on MFA OTP',
      severity: 'High',
      cvss: 8.2,
      status: 'Proved',
    },
    {
      category: 'API3:2023 Broken Object Property Level Auth',
      finding: 'F-1023: Mass Assignment Allows Role Escalation',
      severity: 'Critical',
      cvss: 9.3,
      status: 'Proved',
    },
    {
      category: 'API5:2023 Broken Function Level Authorization',
      finding: 'F-1022: BFLA on Instant Payout Processing',
      severity: 'Critical',
      cvss: 9.6,
      status: 'Proved',
    },
    {
      category: 'API9:2023 Improper Inventory Management',
      finding: 'F-1025: Unauthenticated Debug Shadow Route',
      severity: 'High',
      cvss: 7.8,
      status: 'Proved',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl cyber-card bg-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              EXECUTIVE AUDIT & COMPLIANCE REPORT
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold uppercase"
              style={{
                backgroundColor: currentConfig.badgeBg,
                color: currentConfig.badgeText,
                borderColor: currentConfig.badgeBorder,
              }}
            >
              SOC2 / PCI-DSS 4.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Export audit-ready evidence reports with zero false-positive differential proofs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap z-10 font-mono">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 cyber-glow-btn rounded-xl text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloading && downloadFormat === 'pdf' ? 'Generating PDF...' : 'Export PDF'}</span>
          </button>
          <button
            onClick={() => handleDownload('sarif')}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>SARIF v2.1</span>
          </button>
        </div>
      </div>

      {/* OWASP Top 10 Compliance Matrix */}
      <div className="p-6 rounded-2xl cyber-card space-y-4 font-mono bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              OWASP API Security Top 10 Compliance Matrix
            </h3>
          </div>
          <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            5 Categories Breached
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-2.5 px-3">OWASP Category</th>
                <th className="py-2.5 px-3">Mapped Finding</th>
                <th className="py-2.5 px-3">CVSS</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Evidence State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {owaspMapping.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {item.category}
                  </td>
                  <td className="py-3 px-3 text-purple-700 font-bold">
                    {item.finding}
                  </td>
                  <td className="py-3 px-3">
                    <ScoreBadge score={item.cvss} />
                  </td>
                  <td className="py-3 px-3">
                    <SeverityBadge severity={item.severity} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      100% PROVED
                    </span>
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
