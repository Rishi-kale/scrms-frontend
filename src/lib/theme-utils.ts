import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

export function useThemeClasses() {
  const { theme, isDark } = useTheme();
  
  return {
    // Background classes
    bg: {
      primary: "bg-primary",
      secondary: "bg-secondary", 
      accent: "bg-accent",
      muted: "bg-muted",
      card: "bg-card",
      sidebar: "bg-sidebar",
      destructive: "bg-destructive",
    },
    
    // Text classes
    text: {
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent-foreground",
      muted: "text-muted-foreground",
      card: "text-card-foreground",
      sidebar: "text-sidebar-foreground",
      destructive: "text-destructive",
    },
    
    // Border classes
    border: {
      primary: "border-primary",
      secondary: "border-secondary",
      accent: "border-accent",
      muted: "border-muted",
      card: "border-card",
      sidebar: "border-sidebar-border",
      destructive: "border-destructive",
    },
    
    // Button variants
    button: {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      accent: "bg-accent text-accent-foreground hover:bg-accent/90",
      destructive: "bg-destructive text-white hover:bg-destructive/90",
      outline: "border border-border bg-background hover:bg-accent/50 hover:text-accent-foreground",
      ghost: "hover:bg-accent/50 hover:text-accent-foreground",
    },
    
    // Card styles
    card: "bg-card text-card-foreground border border-border",
    
    // Sidebar styles
    sidebar: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
    
    // Utility functions
    theme: theme,
    isDark,
    
    // Helper function to combine classes
    combine: (...classes: (string | undefined | null | false)[]) => cn(...classes),
  };
}

export function getThemeColor(color: string, fallback?: string) {
  // This function should be used within a React component that has access to useTheme
  return fallback || color;
}

export function createThemeStyles(styles: Record<string, string>) {
  // This function should be used within a React component that has access to useTheme
  return styles.default || '';
}

export const statusColors: Record<string, string> = {
  APPLIED: "bg-purple-100 text-purple-800 border-purple-200",
  TEST_SENT: "bg-blue-100 text-blue-800 border-blue-200",
  TEST_COMPLETED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  TEST_PASSED: "bg-green-100 text-green-800 border-green-200",
  TEST_FAILED: "bg-red-100 text-red-800 border-red-200",
  HIRED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  OFFER_SENT: "bg-orange-100 text-orange-800 border-orange-200",
  OFFER_ACCEPTED: "bg-green-100 text-green-800 border-green-200",
  OFFER_DECLINED: "bg-red-100 text-red-800 border-red-200",
  REJECTED: "bg-gray-200 text-gray-800 border-gray-300",
  ON_HOLD: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CLOSED: "bg-slate-100 text-slate-800 border-slate-200",
};
