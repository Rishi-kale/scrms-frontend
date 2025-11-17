import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'default' | 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  teal: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  ring: string;
  destructive: string;
  muted: string;
  mutedForeground: string;
  popover: string;
  popoverForeground: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export const themes: Record<ThemeType, ThemeColors> = {
  default: {
    primary: '#2b6cb0', // Blue-800 for active states
    secondary: '#ccfbf1', // Emerald-500 for teal/green accents
    accent: '#ccfbf1', // Slate-100 for light backgrounds
    teal: '#0d9488', // Teal-600 for chips and accents
    background: '#f8fafc', // Slate-50 for main background
    foreground: '#1e293b', // Slate-800 for dark text
    card: '#f8fafc',
    cardForeground: '#1e293b',
    border: '#e2e8f0', // Slate-200
    input: '#ffffff',
    ring: '#2b6cb0', // Blue-800
    destructive: '#ef4444', // Red-500
    muted: '#f1f5f9', // Slate-100
    mutedForeground: '#64748b', // Slate-500
    popover: '#ffffff',
    popoverForeground: '#1e293b',
    sidebar: '#f8fafc', // Slate-50 for sidebar background
    sidebarForeground: '#1e293b', // Slate-800 for sidebar text
    sidebarPrimary: '#2b6cb0', // Blue-800 for active sidebar items
    sidebarPrimaryForeground: '#ffffff', // White text for active items
    sidebarAccent: '#ccfbf1', // Emerald-500 for inactive item backgrounds
    sidebarAccentForeground: '#1e293b', // Slate-800 for inactive text
    sidebarBorder: '#e2e8f0', // Slate-200
    sidebarRing: '#2b6cb0', // Blue-800
  },
  light: {
    primary: '#0f172a', // Slate-900
    secondary: '#2b6cb0', // Blue-600
    accent: '#f8fafc', // Slate-50
    teal: '#0d9488', // Teal-600 for chips and accents
    background: '#ffffff',
    foreground: '#0f172a', // Slate-900
    card: '#ffffff',
    cardForeground: '#0f172a',
    border: '#e2e8f0', // Slate-200
    input: '#ffffff',
    ring: '#0f172a', // Slate-900
    destructive: '#ef4444', // Red-500
    muted: '#f1f5f9', // Slate-100
    mutedForeground: '#64748b', // Slate-500
    popover: '#ffffff',
    popoverForeground: '#0f172a',
    sidebar: '#ffffff',
    sidebarForeground: '#0f172a',
    sidebarPrimary: '#0f172a', // Slate-900
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#f1f5f9', // Slate-100
    sidebarAccentForeground: '#0f172a',
    sidebarBorder: '#e2e8f0', // Slate-200
    sidebarRing: '#0f172a', // Slate-900
  },
  dark: {
    primary: '#f8fafc', // Slate-50
    secondary: '#3b82f6', // Blue-500
    accent: '#1e293b', // Slate-800
    teal: '#0d9488', // Teal-600 for chips and accents
    background: '#0f172a', // Slate-900
    foreground: '#f8fafc', // Slate-50
    card: '#1e293b', // Slate-800
    cardForeground: '#f8fafc', // Slate-50
    border: '#334155', // Slate-700
    input: '#1e293b', // Slate-800
    ring: '#3b82f6', // Blue-500
    destructive: '#ef4444', // Red-500
    muted: '#334155', // Slate-700
    mutedForeground: '#94a3b8', // Slate-400
    popover: '#1e293b', // Slate-800
    popoverForeground: '#f8fafc', // Slate-50
    sidebar: '#1e293b', // Slate-800
    sidebarForeground: '#f8fafc', // Slate-50
    sidebarPrimary: '#3b82f6', // Blue-500
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#334155', // Slate-700
    sidebarAccentForeground: '#f8fafc', // Slate-50
    sidebarBorder: '#475569', // Slate-600
    sidebarRing: '#3b82f6', // Blue-500
  },
};

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: ThemeColors;
  isDark: boolean;
  getStoredTheme: () => ThemeType | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('default');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('Company-theme') as ThemeType;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('Company-theme', theme);

    // Apply theme to document
    const colors = themes[theme];
    const root = document.documentElement;

    // Set CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Set theme class for Tailwind
    root.classList.remove('theme-default', 'theme-light', 'theme-dark');
    root.classList.add(`theme-${theme}`);

    // Set dark mode class for Tailwind dark mode
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const colors = themes[theme];
  const isDark = theme === 'dark';

  const getStoredTheme = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('Company-theme') as ThemeType | null;
    }
    return null;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, isDark, getStoredTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
