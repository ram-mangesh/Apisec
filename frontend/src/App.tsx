import React, { useState, useEffect } from 'react';
import { GlobalShell, ScreenType } from './components/GlobalShell';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProjectSetupScreen } from './screens/ProjectSetupScreen';
import { DiscoveryScreen } from './screens/DiscoveryScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { EndpointAnalysisScreen } from './screens/EndpointAnalysisScreen';
import { FindingDetailsScreen } from './screens/FindingDetailsScreen';
import { EvidenceScreen } from './screens/EvidenceScreen';
import { AttackPathGraphScreen } from './screens/AttackPathGraphScreen';
import { ValidationScreen } from './screens/ValidationScreen';
import { AICopilotScreen } from './screens/AICopilotScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

import { MOCK_PROJECTS, MOCK_ENDPOINTS, MOCK_FINDINGS, MOCK_ATTACK_PATHS } from './api';
import { Project } from './types';
import { Search, X, Layers, ShieldAlert, GitFork, ArrowRight, CornerDownLeft } from 'lucide-react';
import { MethodBadge, SeverityBadge } from './components/Badges';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

const AppContent: React.FC = () => {
  const { currentConfig } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [currentProject, setCurrentProject] = useState<Project>(MOCK_PROJECTS[0]);

  // Deep-linking selection states
  const [selectedFindingId, setSelectedFindingId] = useState<string>('F-1021');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('ep-user-01');
  const [selectedPathId, setSelectedPathId] = useState<string>('AP-001');

  // Global Search Modal state (Cmd+K)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Global Navigation
  const handleNavigate = (screen: ScreenType, id?: string) => {
    setCurrentScreen(screen);
    if (id) {
      if (screen === 'findings' || screen === 'evidence' || screen === 'validation') {
        setSelectedFindingId(id);
      } else if (screen === 'endpoint-analysis' || screen === 'inventory') {
        setSelectedEndpointId(id);
      } else if (screen === 'attack-paths') {
        setSelectedPathId(id);
      }
    }
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered search results
  const searchResults = {
    endpoints: MOCK_ENDPOINTS.filter(
      (ep) =>
        ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.service.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 4),
    findings: MOCK_FINDINGS.filter(
      (f) =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.cwe.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 4),
    paths: MOCK_ATTACK_PATHS.filter(
      (ap) =>
        ap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ap.id.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
  };

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={() => setCurrentScreen('dashboard')} />;
  }

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            currentProject={currentProject}
            onNavigate={handleNavigate}
          />
        );
      case 'project-setup':
        return (
          <ProjectSetupScreen
            currentProject={currentProject}
            onUpdateProject={(p) => setCurrentProject(p)}
          />
        );
      case 'discovery':
        return (
          <DiscoveryScreen
            currentProject={currentProject}
            onNavigateToInventory={() => handleNavigate('inventory')}
            onNavigateToFindings={() => handleNavigate('findings')}
            onNavigateToAttackPaths={() => handleNavigate('attack-paths')}
          />
        );
      case 'inventory':
        return (
          <InventoryScreen
            onSelectEndpoint={(epId) => {
              setSelectedEndpointId(epId);
              handleNavigate('endpoint-analysis', epId);
            }}
          />
        );
      case 'endpoint-analysis':
        return (
          <EndpointAnalysisScreen
            endpointId={selectedEndpointId}
            onNavigate={handleNavigate}
          />
        );
      case 'findings':
        return (
          <FindingDetailsScreen
            findingId={selectedFindingId}
            onNavigate={handleNavigate}
          />
        );
      case 'evidence':
        return (
          <EvidenceScreen
            findingId={selectedFindingId}
            onNavigate={handleNavigate}
          />
        );
      case 'attack-paths':
        return (
          <AttackPathGraphScreen
            pathId={selectedPathId}
            onNavigate={handleNavigate}
          />
        );
      case 'validation':
        return (
          <ValidationScreen
            initialFindingId={selectedFindingId}
            onNavigate={handleNavigate}
          />
        );
      case 'copilot':
        return <AICopilotScreen onNavigate={handleNavigate} />;
      case 'reports':
        return (
          <ReportsScreen
            currentProject={currentProject}
            onNavigateToFinding={(id) => handleNavigate('findings', id)}
            onNavigateToPath={(id) => handleNavigate('attack-paths', id)}
          />
        );
      case 'settings':
        return <SettingsScreen />;
      default:
        return (
          <DashboardScreen
            currentProject={currentProject}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <>
      <GlobalShell
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        currentProject={currentProject}
        onSelectProject={(proj) => setCurrentProject(proj)}
        selectedFindingId={selectedFindingId}
        selectedEndpointId={selectedEndpointId}
        selectedPathId={selectedPathId}
        onOpenSearch={() => setSearchOpen(true)}
        onLogout={() => setCurrentScreen('login')}
      >
        {renderActiveScreen()}
      </GlobalShell>

      {/* Global Cmd+K Search Palette Modal with Clean White Theme */}
      {searchOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4 z-50 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 bg-white">
            {/* Input Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="h-5 w-5 shrink-0" style={{ color: currentConfig.primary }} />
              <input
                type="text"
                autoFocus
                placeholder="Search endpoints, vulnerabilities, attack paths, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm bg-transparent border-none focus:outline-hidden text-slate-900 placeholder-slate-400 font-mono"
              />
              <kbd className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-xs border border-slate-200">
                ESC
              </kbd>
            </div>

            {/* Results Body */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs font-mono">
              {/* Findings */}
              {searchResults.findings.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                    <span>Vulnerability Findings</span>
                  </div>
                  {searchResults.findings.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        handleNavigate('findings', f.id);
                        setSearchOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold" style={{ color: currentConfig.primary }}>{f.id}</span>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-purple-700">
                            {f.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{f.endpoint}</div>
                        </div>
                      </div>
                      <SeverityBadge severity={f.severity} size="sm" />
                    </div>
                  ))}
                </div>
              )}

              {/* Endpoints */}
              {searchResults.endpoints.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-sky-500" />
                    <span>API Inventory Routes</span>
                  </div>
                  {searchResults.endpoints.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => {
                        handleNavigate('endpoint-analysis', ep.id);
                        setSearchOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <MethodBadge method={ep.method} size="sm" />
                        <span className="font-mono text-slate-900 font-medium group-hover:text-purple-700">
                          {ep.path}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{ep.service}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Attack Paths */}
              {searchResults.paths.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                    <GitFork className="h-3.5 w-3.5 text-amber-500" />
                    <span>Correlated Attack Paths</span>
                  </div>
                  {searchResults.paths.map((ap) => (
                    <div
                      key={ap.id}
                      onClick={() => {
                        handleNavigate('attack-paths', ap.id);
                        setSearchOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-purple-700">
                          {ap.id}: {ap.title}
                        </div>
                        <div className="text-[10px] text-slate-400">Choke: {ap.choke_point}</div>
                      </div>
                      <SeverityBadge severity={ap.risk_level} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 font-mono">
              Press <kbd className="font-mono bg-white text-slate-600 px-1.5 py-0.5 border border-slate-200 rounded shadow-xs">ESC</kbd> to exit search
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
