import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColor =
  | 'royal-purple'
  | 'electric-indigo'
  | 'ocean-cyan'
  | 'emerald-green'
  | 'crimson-rose'
  | 'amber-gold';

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  primary: string;
  primaryHover: string;
  glow: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  activeNavBg: string;
  dotColor: string;
}

export const THEME_PRESETS: Record<ThemeColor, ThemeConfig> = {
  'royal-purple': {
    id: 'royal-purple',
    name: 'Royal Purple',
    primary: '#7C3AED',
    primaryHover: '#6D28D9',
    glow: 'rgba(124, 58, 237, 0.25)',
    accent: '#8B5CF6',
    badgeBg: '#F5F3FF',
    badgeText: '#6D28D9',
    badgeBorder: '#DDD6FE',
    activeNavBg: '#F3E8FF',
    dotColor: '#7C3AED',
  },
  'electric-indigo': {
    id: 'electric-indigo',
    name: 'Electric Indigo',
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    glow: 'rgba(79, 70, 229, 0.25)',
    accent: '#6366F1',
    badgeBg: '#EEF2FF',
    badgeText: '#4338CA',
    badgeBorder: '#C7D2FE',
    activeNavBg: '#E0E7FF',
    dotColor: '#4F46E5',
  },
  'ocean-cyan': {
    id: 'ocean-cyan',
    name: 'Ocean Cyan',
    primary: '#0284C7',
    primaryHover: '#0369A1',
    glow: 'rgba(2, 132, 199, 0.25)',
    accent: '#38BDF8',
    badgeBg: '#F0F9FF',
    badgeText: '#0369A1',
    badgeBorder: '#BAE6FD',
    activeNavBg: '#E0F2FE',
    dotColor: '#0284C7',
  },
  'emerald-green': {
    id: 'emerald-green',
    name: 'Emerald Mint',
    primary: '#059669',
    primaryHover: '#047857',
    glow: 'rgba(5, 150, 105, 0.25)',
    accent: '#10B981',
    badgeBg: '#ECFDF5',
    badgeText: '#047857',
    badgeBorder: '#A7F3D0',
    activeNavBg: '#D1FAE5',
    dotColor: '#059669',
  },
  'crimson-rose': {
    id: 'crimson-rose',
    name: 'Crimson Rose',
    primary: '#E11D48',
    primaryHover: '#BE123C',
    glow: 'rgba(225, 29, 72, 0.25)',
    accent: '#F43F5E',
    badgeBg: '#FFF1F2',
    badgeText: '#BE123C',
    badgeBorder: '#FECDD3',
    activeNavBg: '#FFE4E6',
    dotColor: '#E11D48',
  },
  'amber-gold': {
    id: 'amber-gold',
    name: 'Amber Gold',
    primary: '#D97706',
    primaryHover: '#B45309',
    glow: 'rgba(217, 119, 6, 0.25)',
    accent: '#F59E0B',
    badgeBg: '#FFFBEB',
    badgeText: '#B45309',
    badgeBorder: '#FDE68A',
    activeNavBg: '#FEF3C7',
    dotColor: '#D97706',
  },
};

interface ThemeContextType {
  colorTheme: ThemeColor;
  setColorTheme: (theme: ThemeColor) => void;
  currentConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorTheme, setColorThemeState] = useState<ThemeColor>(() => {
    return (localStorage.getItem('apisec_white_color_theme') as ThemeColor) || 'royal-purple';
  });

  const setColorTheme = (theme: ThemeColor) => {
    setColorThemeState(theme);
    localStorage.setItem('apisec_white_color_theme', theme);
  };

  const currentConfig = THEME_PRESETS[colorTheme] || THEME_PRESETS['royal-purple'];

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', colorTheme);
    root.setAttribute('data-mode', 'pure-white');

    // Dynamic CSS variables for high-tech custom rendering on Pure White Theme
    root.style.setProperty('--color-primary', currentConfig.primary);
    root.style.setProperty('--color-primary-hover', currentConfig.primaryHover);
    root.style.setProperty('--color-primary-glow', currentConfig.glow);
    root.style.setProperty('--color-accent', currentConfig.accent);

    root.style.setProperty('--bg-base', '#F8FAFC');
    root.style.setProperty('--bg-sidebar', '#FFFFFF');
    root.style.setProperty('--bg-header', '#FFFFFF');
    root.style.setProperty('--bg-card', '#FFFFFF');
    root.style.setProperty('--bg-card-hover', '#F8FAFC');
    root.style.setProperty('--border-subtle', '#E2E8F0');
    root.style.setProperty('--border-glow', currentConfig.glow);
    root.style.setProperty('--text-heading', '#0F172A');
    root.style.setProperty('--text-body', '#334155');
    root.style.setProperty('--text-muted', '#64748B');
  }, [colorTheme, currentConfig]);

  return (
    <ThemeContext.Provider
      value={{
        colorTheme,
        setColorTheme,
        currentConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
