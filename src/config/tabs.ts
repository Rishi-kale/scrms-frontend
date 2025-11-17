import { 
  Activity, 
  Users, 
  Settings, 
  Shield, 
  UserCheck, 
  Calendar, 
  Award,
  User,
  Shield as ShieldIcon,
  Wrench
} from "lucide-react";

export interface TabConfig {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  disabled?: boolean;
}

export interface TabSection {
  id: string;
  title: string;
  tabs: TabConfig[];
}

// Profile Page Tabs
export const profileTabs: TabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Activity,
    description: "View your profile overview and statistics"
  },
  {
    id: "activity",
    label: "Activity",
    icon: Calendar,
    description: "Track your recent activities and actions"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Manage your account settings and preferences"
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Security settings and authentication"
  }
];

// Admin Page Tabs
export const adminTabs: TabConfig[] = [
  {
    id: "users",
    label: "Users",
    icon: User,
    description: "Manage user accounts and permissions"
  },
  {
    id: "roles",
    label: "Roles",
    icon: Shield,
    description: "Define and manage user roles"
  },
  {
    id: "permissions",
    label: "Permissions",
    icon: ShieldIcon,
    description: "Configure system permissions"
  },
];

// Job Creation Steps (if you want to make them dynamic too)
export const jobCreationSteps: TabConfig[] = [
  {
    id: "basic",
    label: "Basic Info",
    icon: UserCheck,
    description: "Basic job information"
  },
  {
    id: "details",
    label: "Details",
    icon: Settings,
    description: "Additional details and job summary"
  },
  {
    id: "generate",
    label: "AI Generate",
    icon: Activity,
    description: "Review and generate job description"
  }
];

// Helper function to get tab by ID
export const getTabById = (tabs: TabConfig[], id: string): TabConfig | undefined => {
  return tabs.find(tab => tab.id === id);
};

// Helper function to get tab index
export const getTabIndex = (tabs: TabConfig[], id: string): number => {
  return tabs.findIndex(tab => tab.id === id);
};

// Helper function to check if tab is valid
export const isValidTab = (tabs: TabConfig[], id: string): boolean => {
  return tabs.some(tab => tab.id === id);
};
