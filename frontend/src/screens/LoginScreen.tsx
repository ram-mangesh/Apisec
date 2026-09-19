import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, CheckCircle, Key, Server, Sparkles, Terminal } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { currentConfig } = useTheme();
  const [email, setEmail] = useState('anshu.bind@acmeprod.io');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 600);
  };

  const handleDemoLogin = (userEmail: string) => {
    setEmail(userEmail);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between relative overflow-hidden font-sans select-none bg-slate-50">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 cyber-grid-bg pointer-events-none" />

      {/* Top Header */}
      <header className="px-8 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${currentConfig.primary}, ${currentConfig.primaryHover})`,
              boxShadow: `0 4px 14px ${currentConfig.glow}`,
            }}
          >
            <Shield className="h-5 w-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-base font-bold text-slate-900 tracking-wider flex items-center gap-2">
              APISEC <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border" style={{ backgroundColor: currentConfig.badgeBg, color: currentConfig.badgeText, borderColor: currentConfig.badgeBorder }}>v2.4</span>
            </span>
            <span className="text-xs text-slate-500">Continuous API Security & Attack Synthesis</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Zero False-Positive Engine
          </span>
          <span className="h-4 w-px bg-slate-200" />
          <span>SOC2 & PCI-DSS Scoped</span>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md cyber-card rounded-2xl shadow-xl p-8 space-y-6 bg-white border border-slate-200">
          <div className="space-y-2 text-center font-mono">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase border"
              style={{
                backgroundColor: currentConfig.badgeBg,
                color: currentConfig.badgeText,
                borderColor: currentConfig.badgeBorder,
              }}
            >
              <Sparkles className="h-3.5 w-3.5" /> Automated Differential Probing
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Console Access</h1>
            <p className="text-xs text-slate-500 font-sans">
              Access the API security mesh, correlate attack paths, and audit authorizations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left font-mono">
              <label className="text-xs font-bold text-slate-700 uppercase">Operator Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left font-mono">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase">Access Token / Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer font-mono"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to APISEC'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Demo 1-Click Fast Login Profiles */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block text-center font-bold">
              Fast 1-Click Demo Profiles:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin('anshu.bind@acmeprod.io')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-900">Anshu Bind</div>
                <div className="text-[9px] text-slate-500 font-mono">SecOps Lead</div>
              </button>
              <button
                onClick={() => handleDemoLogin('security.auditor@acmeprod.io')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-900">Security Auditor</div>
                <div className="text-[9px] text-slate-500 font-mono">Compliance Lead</div>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-8 py-4 text-center text-xs font-mono text-slate-400 z-10 border-t border-slate-200">
        APISEC Enterprise Causal Graph Platform • Port 8001 Unified HUD
      </footer>
    </div>
  );
};
