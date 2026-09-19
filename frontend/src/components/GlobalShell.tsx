import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Compass,
  Layers,
  FileCode2,
  ShieldAlert,
  Split,
  GitFork,
  CheckCircle2,
  Sparkles,
  FileText,
  Search,
  Bell,
  ChevronDown,
  Shield,
  Activity,
  LogOut,
  Settings,
  Check,
  Palette,
  Terminal,
  Cpu,
  Radio,
  Zap,
  Lock,
} from 'lucide-react';
import { NotificationItem, Project } from '../types';
import { MOCK_PROJECTS, MOCK_NOTIFICATIONS } from '../api';
import { useTheme, THEME_PRESETS, ThemeColor } from '../theme/ThemeContext';

export type ScreenType =
  | 'login'
  | 'dashboard'
  | 'project-setup'
  | 'discovery'
  | 'inventory'
  | 'endpoint-analysis'
  | 'findings'
  | 'evidence'
  | 'attack-paths'
  | 'validation'
  | 'copilot'
  | 'reports'
  | 'settings';

interface GlobalShellProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, id?: string) => void;
  currentProject: Project;
  onSelectProject: (project: Project) => void;
  selectedFindingId?: string;
  selectedEndpointId?: string;
  selectedPathId?: string;
  children: React.ReactNode;
  onOpenSearch?: () => void;
  onLogout?: () => void;
}

export const GlobalShell: React.FC<GlobalShellProps> = ({
  currentScreen,
  onNavigate,
  currentProject,
  onSelectProject,
  selectedFindingId,
  selectedEndpointId,
  selectedPathId,
  children,
  onOpenSearch,
  onLogout,
}) => {
  const { colorTheme, setColorTheme, currentConfig } = useTheme();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const projRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (projRef.current && !projRef.current.contains(event.target as Node)) {
        setProjectDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const markAllNotifsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const navSections = [
    {
      title: 'CORE ENGINE',
      items: [
        { id: 'dashboard' as ScreenType, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'inventory' as ScreenType, label: 'API Inventory', icon: Layers, badge: '21' },
        { id: 'discovery' as ScreenType, label: 'Discovery Mesh', icon: Compass, badge: 'Live' },
        { id: 'attack-paths' as ScreenType, label: 'Attack Paths', icon: GitFork, badge: '3', badgeType: 'warning' },
      ],
    },
    {
      title: 'SECURITY AUDIT',
      items: [
        { id: 'findings' as ScreenType, label: 'Findings', icon: ShieldAlert, badge: '7', badgeType: 'critical' },
        { id: 'evidence' as ScreenType, label: 'Evidence Diff', icon: Split },
        { id: 'validation' as ScreenType, label: 'Live Prober', icon: CheckCircle2, badge: 'Auto' },
        { id: 'copilot' as ScreenType, label: 'AI Copilot', icon: Sparkles, badge: 'AI', badgeType: 'ai' },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'reports' as ScreenType, label: 'Reports', icon: FileText },
        { id: 'project-setup' as ScreenType, label: 'Projects & Scope', icon: FolderKanban },
        { id: 'settings' as ScreenType, label: 'Settings', icon: Settings },
      ],
    },
  ];

  const getBreadcrumbs = () => {
    const crumbs = [{ label: currentProject.name, screen: 'dashboard' as ScreenType }];
    let foundLabel = '';
    navSections.forEach((sec) => {
      const match = sec.items.find((n) => n.id === currentScreen);
      if (match) foundLabel = match.label;
    });

    if (foundLabel) {
      crumbs.push({ label: foundLabel, screen: currentScreen });
    }

    if (currentScreen === 'findings' && selectedFindingId) {
      crumbs.push({ label: selectedFindingId, screen: 'findings' as ScreenType });
    } else if (currentScreen === 'endpoint-analysis' && selectedEndpointId) {
      crumbs.push({ label: selectedEndpointId, screen: 'endpoint-analysis' as ScreenType });
    } else if (currentScreen === 'attack-paths' && selectedPathId) {
      crumbs.push({ label: selectedPathId, screen: 'attack-paths' as ScreenType });
    }

    return crumbs;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden antialiased font-sans bg-slate-50 text-slate-800">
      {/* ========================================================================= */}
      {/* FULL-HEIGHT MODERN WHITE THEME SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20 min-w-20' : 'w-[260px] min-w-[260px]'
        } shrink-0 flex flex-col justify-between transition-all duration-300 z-30 select-none bg-white border-r border-slate-200 shadow-xs h-full`}
      >
        {/* Brand Top Header */}
        <div className="h-[74px] shrink-0 flex items-center px-4 border-b border-slate-200 justify-between">
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${currentConfig.primary}, ${currentConfig.primaryHover})`,
                boxShadow: `0 4px 14px ${currentConfig.glow}`,
              }}
            >
              <Shield className="h-5 w-5" />
            </div>

            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[16px] font-black tracking-wider text-slate-900">
                    APISEC
                  </span>
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded tracking-widest uppercase border"
                    style={{
                      backgroundColor: currentConfig.badgeBg,
                      color: currentConfig.badgeText,
                      borderColor: currentConfig.badgeBorder,
                    }}
                  >
                    v2.4
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-tight">
                  API Security & Attack Mesh
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links - Full Vertical Space */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {sec.title}
                </div>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                    } h-[38px] rounded-xl text-[13px] font-semibold transition-all duration-150 relative group cursor-pointer ${
                      isActive
                        ? 'shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: currentConfig.activeNavBg,
                            color: currentConfig.primary,
                            borderLeft: `3.5px solid ${currentConfig.primary}`,
                            fontWeight: 700,
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <Icon
                        className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110"
                        style={{ color: isActive ? currentConfig.primary : 'currentColor' }}
                      />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!sidebarCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          item.badgeType === 'critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.badgeType === 'warning'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : item.badgeType === 'ai'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Bottom: Scope Status Card + User Profile */}
        <div className="p-3 border-t border-slate-200 space-y-2 shrink-0 bg-white">
          {!sidebarCollapsed && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-sans">
              <div className="flex items-center justify-between font-mono font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Scope Status
                </span>
                <span className="text-emerald-700 font-bold">ONLINE</span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">{currentProject.name}</div>
              <div className="text-[10px] text-slate-500 font-mono">21 Endpoints • 7 Proved Vulnerabilities</div>
            </div>
          )}

          {/* User Profile Card */}
          <div className="relative" ref={userRef}>
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white shrink-0 shadow-xs"
                style={{
                  background: `linear-gradient(135deg, ${currentConfig.primary}, ${currentConfig.primaryHover})`,
                }}
              >
                SEC
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col truncate flex-1">
                  <span className="text-[12px] font-bold text-slate-800 truncate">SecOps Lead</span>
                  <span className="text-[10px] text-slate-500 font-mono truncate">Role: Admin</span>
                </div>
              )}
              {!sidebarCollapsed && <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            </div>

            {userDropdownOpen && (
              <div className="absolute bottom-12 left-0 w-56 rounded-xl shadow-xl py-2 z-50 text-[12px] border border-slate-200 bg-white animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  User Session
                </div>
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Security Settings
                </button>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: Top Header + Content Area */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-[74px] shrink-0 border-b border-slate-200 px-6 flex items-center justify-between z-20 bg-white">
          {/* Breadcrumb Left */}
          <div className="flex items-center gap-2 text-[12px]">
            {getBreadcrumbs().map((crumb, idx, arr) => (
              <React.Fragment key={idx}>
                <button
                  onClick={() => onNavigate(crumb.screen)}
                  className={`transition-colors truncate max-w-[220px] font-medium ${
                    idx === arr.length - 1 ? 'font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  style={idx === arr.length - 1 ? { color: currentConfig.primary } : {}}
                >
                  {crumb.label}
                </button>
                {idx < arr.length - 1 && <span className="text-slate-300 font-mono">/</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Right Controls: Theme Color Switcher + Project Selector + Search + Notifications */}
          <div className="flex items-center gap-3">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center justify-between w-[240px] lg:w-[280px] h-[38px] px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-[12px] text-slate-500 transition-all hover:border-slate-400 hover:text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4" style={{ color: currentConfig.primary }} />
                <span>Search routes, CVEs, paths...</span>
              </div>
              <kbd className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* MULTI-THEME COLOR PALETTE SWITCHER DROPDOWN */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-2 h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 transition-all hover:bg-slate-50 shadow-xs"
                title="Change Color Theme"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs"
                  style={{
                    backgroundColor: currentConfig.primary,
                  }}
                />
                <span className="hidden sm:inline font-mono text-xs">{currentConfig.name}</span>
                <Palette className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl shadow-xl py-3 px-3 z-50 text-[12px] border border-slate-200 bg-white animate-in fade-in">
                  <div className="pb-2 mb-2 border-b border-slate-100">
                    <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Theme Accent Color
                    </span>
                  </div>

                  {/* Preset Colors Grid */}
                  <div className="space-y-1">
                    {(Object.keys(THEME_PRESETS) as ThemeColor[]).map((key) => {
                      const item = THEME_PRESETS[key];
                      const isSelected = colorTheme === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setColorTheme(key);
                            setThemeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-slate-100 text-slate-900 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-3.5 w-3.5 rounded-full shadow-xs"
                              style={{
                                backgroundColor: item.primary,
                              }}
                            />
                            <span>{item.name}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4" style={{ color: item.primary }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Environment Project Selector */}
            <div className="relative" ref={projRef}>
              <button
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className="flex items-center gap-2 h-[38px] px-3.5 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-800 transition-all hover:bg-slate-50 shadow-xs"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate max-w-[130px]">{currentProject.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {projectDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-xl py-2 z-50 text-[12px] border border-slate-200 bg-white animate-in fade-in">
                  <div className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Security Scope
                  </div>
                  {MOCK_PROJECTS.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        onSelectProject(proj);
                        setProjectDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{proj.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{proj.environment}</div>
                      </div>
                      {proj.id === currentProject.id && (
                        <Check className="h-4 w-4" style={{ color: currentConfig.primary }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Drawer Toggle */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex items-center justify-center h-[38px] w-[38px] rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 shadow-xs"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-84 rounded-2xl shadow-xl py-2 z-50 text-[12px] border border-slate-200 bg-white animate-in fade-in">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 text-[13px]">Real-Time Cyber Alerts</span>
                    <button
                      onClick={markAllNotifsRead}
                      className="text-[11px] hover:underline font-mono font-semibold"
                      style={{ color: currentConfig.primary }}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-slate-50/70' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-slate-900 text-[12px]">{notif.title}</div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{notif.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 cyber-grid-bg bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};
