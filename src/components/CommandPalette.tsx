"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  BarChart3,
  Briefcase,
  Users,
  Settings,
  Plus,
  Upload,
  Search,
  X,
  Building,
  FileText,
  UserPlus,
  TrendingUp,
  Shield,
  Database,
  HelpCircle,
  ExternalLink,
  Palette,
  Bell,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  Command as CommandIcon,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandAction {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string[];
  action: () => void;
  category: "navigation" | "quick-actions" | "portal" | "reports" | "settings" | "help";
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Detect OS for proper shortcut display
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdKey = isMac ? "⌘" : "Ctrl";

  // Expose open method globally for button clicks
  useEffect(() => {
    (window as any).openCommandPalette = () => setOpen(true);
    return () => {
      delete (window as any).openCommandPalette;
    };
  }, []);

  const navigationActions: CommandAction[] = [
    {
      id: "dashboard",
      title: "Go to Dashboard",
      description: "View your hiring overview and metrics",
      icon: BarChart3,
      shortcut: [cmdKey, "D"],
      action: () => router.push("/dashboard"),
      category: "navigation",
    },
    {
      id: "jobs",
      title: "Go to Jobs",
      description: "Manage job postings and listings",
      icon: Briefcase,
      shortcut: [cmdKey, "J"],
      action: () => router.push("/jobs"),
      category: "navigation",
    },
    {
      id: "candidates",
      title: "Go to Candidates",
      description: "View and manage candidate profiles",
      icon: Users,
      shortcut: [cmdKey, "C"],
      action: () => router.push("/candidates"),
      category: "navigation",
    },
    {
      id: "admin",
      title: "Go to Admin",
      description: "Manage users, roles, and permissions",
      icon: Shield,
      shortcut: [cmdKey, "A"],
      action: () => router.push("/admin"),
      category: "navigation",
    },
    {
      id: "analytics",
      title: "Go to Analytics",
      description: "View detailed reports and insights",
      icon: TrendingUp,
      shortcut: [cmdKey, "R"],
      action: () => router.push("/analytics"),
      category: "navigation",
    },
  ];

  const quickActions: CommandAction[] = [
    {
      id: "create-job",
      title: "Create New Job",
      description: "Post a new job opening",
      icon: Plus,
      shortcut: [cmdKey, "⇧", "J"],
      action: () => router.push("/jobs/create"),
      category: "quick-actions",
    },
    {
      id: "add-candidate",
      title: "Add Candidate",
      description: "Add a new candidate to the system",
      icon: UserPlus,
      shortcut: [cmdKey, "⇧", "C"],
      action: () => router.push("/candidates/create"),
      category: "quick-actions",
    },
    {
      id: "upload-resumes",
      title: "Upload Resumes",
      description: "Bulk upload candidate resumes",
      icon: Upload,
      shortcut: [cmdKey, "⇧", "U"],
      action: () => router.push("/candidates/upload"),
      category: "quick-actions",
    },
  ];

  const portalActions: CommandAction[] = [
    {
      id: "switch-admin",
      title: "Switch to Admin Portal",
      description: "Access administrative functions",
      icon: Shield,
      action: () => router.push("/admin"),
      category: "portal",
    },
  ];

  const reportActions: CommandAction[] = [
    {
      id: "view-reports",
      title: "View Reports",
      description: "Access hiring analytics and reports",
      icon: BarChart3,
      action: () => router.push("/reports"),
      category: "reports",
    },
    {
      id: "export-data",
      title: "Export Data",
      description: "Export candidate and job data",
      icon: Download,
      action: () => router.push("/reports/export"),
      category: "reports",
    },
  ];

  const settingsActions: CommandAction[] = [
    {
      id: "system-settings",
      title: "System Settings",
      description: "Configure application settings",
      icon: Settings,
      action: () => router.push("/settings"),
      category: "settings",
    },
    {
      id: "theme-toggle",
      title: "Toggle Theme",
      description: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
      icon: Palette,
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      category: "settings",
    },
  ];

  const helpActions: CommandAction[] = [
    {
      id: "help-docs",
      title: "Help Documentation",
      description: "Access help and documentation",
      icon: HelpCircle,
      action: () => window.open("/help", "_blank"),
      category: "help",
    },
  ];

  const allActions = [
    ...navigationActions,
    ...quickActions,
    ...portalActions,
    ...reportActions,
    ...settingsActions,
    ...helpActions,
  ];

  const filteredActions = allActions.filter((action) =>
    action.title.toLowerCase().includes(search.toLowerCase()) ||
    action.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      setOpen((open) => !open);
    }
    if (event.key === "Escape") {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleAction = (action: CommandAction) => {
    action.action();
    setOpen(false);
    setSearch("");
  };

  const getShortcutDisplay = (shortcut?: string[]) => {
    if (!shortcut) return null;
    return (
      <div className="flex items-center gap-1">
        {shortcut.map((key, index) => (
          <Badge
            key={index}
            variant="default"
            className="h-5 px-1.5 text-xs font-mono"
          >
            {key}
          </Badge>
        ))}
      </div>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "navigation":
        return <ChevronRight className="h-4 w-4" />;
      case "quick-actions":
        return <Plus className="h-4 w-4" />;
      case "portal":
        return <Shield className="h-4 w-4" />;
      case "reports":
        return <BarChart3 className="h-4 w-4" />;
      case "settings":
        return <Settings className="h-4 w-4" />;
      case "help":
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <ChevronRight className="h-4 w-4" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "navigation":
        return "Navigation";
      case "quick-actions":
        return "Quick Actions";
      case "portal":
        return "Portal";
      case "reports":
        return "Reports";
      case "settings":
        return "Settings";
      case "help":
        return "Help";
      default:
        return category;
    }
  };

  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, CommandAction[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" showCloseButton={false}>
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Smart Navigation
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[600px]">
          {/* Search Input */}
          <div className="px-6 py-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 h-12 text-base"
                autoFocus
              />
              {search.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Command List */}
          <div className="flex-1 overflow-y-auto">
            {Object.keys(groupedActions).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No results found
                </h3>
                <p className="text-muted-foreground">
                  Try searching for something else or use the navigation below.
                </p>
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(groupedActions).map(([category, actions]) => (
                  <div key={category} className="mb-6">
                    <div className="flex items-center gap-2 px-2 py-2 mb-2">
                      {getCategoryIcon(category)}
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {getCategoryTitle(category)}
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {actions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleAction(action)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                            "hover:bg-accent/50 hover:text-accent-foreground",
                            "focus:bg-accent/50 focus:text-accent-foreground focus:outline-none"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                              <action.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {action.title}
                              </div>
                              {action.description && (
                                <div className="text-sm text-muted-foreground">
                                  {action.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {action.shortcut && (
                            <div className="flex items-center gap-1">
                              {getShortcutDisplay(action.shortcut)}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t bg-muted/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Press Esc to close</span>
                <span>•</span>
                <span>Use ↑↓ to navigate</span>
                <span>•</span>
                <span>Press Enter to select</span>
              </div>
                             <div className="flex items-center gap-2">
                 <CommandIcon className="h-3 w-3" />
                 <span>{cmdKey}K</span>
               </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
