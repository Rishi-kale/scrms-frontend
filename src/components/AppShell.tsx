"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  Menu,
  LogOut,
  Brain,
  Target,
  FileText,
  RefreshCw,
  BarChart3,
  UserCheck,
  FileSearch,
  ChevronUp,
  ChevronDown,
  Sun,
  Moon,
  User,
  Shield,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Bell,
  Sliders,
  X
} from "lucide-react";
import { clearAccessToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { useUser } from "@/lib/user-context";
import { useConfig } from "@/lib/config-context";
import { CommandPalette } from "@/components/CommandPalette";
import { useQuery } from "@tanstack/react-query";

// Utility function to get user initials
const getUserInitials = (name: string): string => {
  if (!name) return "U";
  const nameParts = name.trim().split(' ');
  if (nameParts.length >= 2) {
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const NAV_ITEMS: NavItem[] = [

  {
    label: "Leads",
    href: "/leads",
    icon: Users,
    description: "Manage leads"
  },
  {
    label: "Projects",
    href: "/projects",
    icon: Users,
    description: "Manage projects"
  },

];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  reportType: string;
  pathname: string;
  leadsCount?: number;
  projectsCount?: number;
  onToggle: (href: string) => void;
  onNavigate: (href: string) => void;
}

const NavItemComponent: React.FC<NavItemComponentProps> = React.memo(({
  item,
  isActive,
  isExpanded,
  reportType,
  pathname,
  leadsCount = 0,
  projectsCount = 0,
  onToggle,
  onNavigate,
}) => {


  const handleClick = useCallback(() => {
    onNavigate(item.href);
  }, [item.href, onToggle, onNavigate]);

  return (
    <div>
      <div
        className={cn(
          "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-accent/50"
        )}
        onClick={handleClick}
      >
        <div className={cn(
          "mr-2 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
          isActive ? "bg-white/20" : "bg-sidebar-accent"
        )}>
          <item.icon
            className={cn(
              "h-3 w-3",
              isActive ? "text-white" : "text-sidebar-accent-foreground"
            )}
          />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{item.label}</span>
            {item.href === "/leads" && leadsCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                {leadsCount}
              </Badge>
            )}
            {item.href === "/projects" && projectsCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                {projectsCount}
              </Badge>
            )}
          </div>
          <span className={cn(
            "text-xs",
            isActive ? "text-sidebar-primary-foreground/80" : "text-muted-foreground"
          )}>
            {item.description}
          </span>
        </div>
      </div>

    </div>
  );
});

NavItemComponent.displayName = "NavItemComponent";

interface UserProfileSectionProps {
  user: any;
  userLoading: boolean;
  onLogout: () => void;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = React.memo(({ user, userLoading, onLogout }) => {
  const userInitials = useMemo(() => getUserInitials(user?.name || ""), [user?.name]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
          <Avatar className="h-8 w-8 md:h-10 md:w-10">
            <AvatarImage src="/api/avatar" alt="User avatar" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
              {userLoading ? "..." : userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 md:w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userLoading ? "Loading..." : user?.name || "Unknown User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userLoading ? "..." : user?.email || "No email"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* User Roles */}
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground mb-2">Roles</p>
          <div className="flex flex-wrap gap-1">
            {userLoading ? (
              <Badge variant="secondary" className="text-xs">Loading...</Badge>
            ) : user?.userRoles && user.userRoles.length > 0 ? (
              user.userRoles.map((userRole: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs bg-[#0d9488] text-white border-[#0d9488]">
                  {userRole.role?.name || userRole.role?.key || "Unknown Role"}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="text-xs">No roles assigned</Badge>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/help" className="flex items-center">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

UserProfileSection.displayName = "UserProfileSection";


export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme, isDark } = useTheme();
  const { user, isLoading: userLoading, clearUser } = useUser();
  const { config } = useConfig();
  const [isPerformanceExpanded, setIsPerformanceExpanded] = useState(true);
  const [loginTime, setLoginTime] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isMac, setIsMac] = useState(false);
  const [reportType, setReportType] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  // Auto-expand Reports section when on a reports page
  useEffect(() => {
    if (pathname === '/reports') {
      setExpandedItems(prev => new Set([...prev, '/reports']));
    }
  }, [pathname]);

  const onLogout = useCallback(() => {
    try {
      clearAccessToken();
      document.cookie = "Company_token=; path=/; max-age=0";
      clearUser();
    } finally {
      router.replace("/login");
    }
  }, [clearUser, router]);

  // Set client flag and login time when component mounts
  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
    setLoginTime(timeString);

    // Detect if user is on Mac
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Safely handle search params on client side
  useEffect(() => {
    if (isClient) {
      const type = searchParams.get('type') || '';
      setReportType(type);
    }
  }, [searchParams, isClient]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col">
        <div className="flex flex-col flex-grow pt-4 bg-background overflow-y-auto border-r border-sidebar-border">
          {/* Logo and Branding */}
          <div className="flex items-center px-4 mb-4">
            <div className="relative">
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="Company Logo"
                  width={40}
                  height={40}
                />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-sidebar-foreground">Company</h1>
              <p className="text-sm text-muted-foreground">Client Partner Platform</p>
            </div>
          </div>


          {/* Main Navigation */}
          <div className="px-4 mb-4">
            <h2 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider mb-2">
              Main Navigation
            </h2>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);

                return (
                  <div key={item.href}>
                    <div
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-accent/50"
                      )}
                      onClick={() => {
                        // if (hasSubItems) {
                        //   const newExpanded = new Set(expandedItems);
                        //   if (isExpanded) {
                        //     newExpanded.delete(item.href);
                        //   } else {
                        //     newExpanded.add(item.href);
                        //   }
                        //   setExpandedItems(newExpanded);
                        // } else {
                        router.push(item.href);
                        // }
                      }}
                    >
                      <div className={cn(
                        "mr-2 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
                        isActive
                          ? "bg-white/20"
                          : "bg-sidebar-accent"
                      )}>
                        <item.icon
                          className={cn(
                            "h-3 w-3",
                            isActive ? "text-white" : "text-sidebar-accent-foreground"
                          )}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className={cn(
                            "text-xs",
                            isActive ? "text-white/80" : "text-muted-foreground"
                          )}>
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`md:hidden fixed top-3 left-2 z-40 bg-background/95 backdrop-blur-sm border border-border/50 transition-opacity ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-background z-50">
          <div className="flex flex-col h-full">
            {/* Logo and Branding */}
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {/* <Brain className="h-6 w-6 text-white" /> */}
                    <Image
                      src="/logo.svg"
                      alt="Company Logo"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/60 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-foreground">Company</h1>
                  <p className="text-sm text-muted-foreground">Client Partner Platform</p>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto">

              {/* Main Navigation */}
              <div className="px-4 py-4">
                <h2 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider mb-2">
                  Main Navigation
                </h2>
                <nav className="space-y-0.5">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-accent/50"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className={cn(
                          "mr-3 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                          isActive
                            ? "bg-white/20"
                            : "bg-sidebar-accent"
                        )}>
                          <item.icon
                            className={cn(
                              "h-4 w-4",
                              isActive ? "text-white" : "text-sidebar-accent-foreground"
                            )}
                          />
                        </div>
                        <span className="font-medium">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex-shrink-0 p-4 border-t">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/api/avatar" alt="User avatar" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userLoading ? "..." : getUserInitials(user?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {userLoading ? "Loading..." : user?.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userLoading ? "..." : user?.userRoles?.[0]?.role?.name || "No role"}
                  </p>
                </div>
              </div>

              {/* User Roles */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Roles</p>
                <div className="flex flex-wrap gap-1">
                  {userLoading ? (
                    <Badge variant="secondary" className="text-xs">Loading...</Badge>
                  ) : user?.userRoles && user.userRoles.length > 0 ? (
                    user.userRoles.map((userRole, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-[#0d9488] text-white border-[#0d9488]">
                        {userRole.role?.name || userRole.role?.key || "Unknown Role"}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-xs">No roles assigned</Badge>
                  )}
                </div>
              </div>


            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Top Header - Desktop & Mobile */}
        <div className="bg-background border-b border-border px-3 sm:px-4 md:px-6 py-3 md:py-4 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 md:space-x-4 pl-12 md:pl-0">
              <div>
                {/* Breadcrumb Navigation */}
                <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="w-px h-4 bg-border"></div>
                  <span className="text-foreground font-medium">
                    {pathname === "/dashboard" ? "Overview" : NAV_ITEMS.find(item => pathname.startsWith(item.href))?.label || "Overview"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              {/* Command Palette Trigger */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if ((window as any).openCommandPalette) {
                    (window as any).openCommandPalette();
                  }
                }}
                className="hidden md:flex items-center gap-2 text-muted-foreground"
              >
                <FileSearch className="h-4 w-4" />
                <span>Search</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">
                    {isClient && isMac ? '⌘' : 'Ctrl'}
                  </span>K
                </kbd>
              </Button>

              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if ((window as any).openCommandPalette) {
                    (window as any).openCommandPalette();
                  }
                }}
                className="md:hidden"
              >
                <FileSearch className="h-4 w-4" />
              </Button>


              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full text-xs">
                  0
                </Badge>
              </Button>

              {/* Theme Toggle */}
              {config.showDarkMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(isDark ? 'default' : 'dark')}
                  title={`Switch to ${isDark ? 'default' : 'dark'} theme`}
                  className="hidden sm:flex"
                >
                  {isDark ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
                </Button>
              )}

              {/* Settings */}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>

              {/* Configuration */}
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link href="/configure">
                  <Sliders className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage src="/api/avatar" alt="User avatar" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                        {userLoading ? "..." : getUserInitials(user?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 md:w-80" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userLoading ? "Loading..." : user?.name || "Unknown User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userLoading ? "..." : user?.email || "No email"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* User Roles */}
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Roles</p>
                    <div className="flex flex-wrap gap-1">
                      {userLoading ? (
                        <Badge variant="secondary" className="text-xs">Loading...</Badge>
                      ) : user?.userRoles && user.userRoles.length > 0 ? (
                        user.userRoles.map((userRole, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-[#0d9488] text-white border-[#0d9488]">
                            {userRole.role?.name || userRole.role?.key || "Unknown Role"}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary" className="text-xs ">No roles assigned</Badge>
                      )}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Account Options */}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Help & Support */}
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="flex items-center">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help & Support</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}


