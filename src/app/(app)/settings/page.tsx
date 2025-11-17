"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import UserManagement from "@/components/settings/UserManagement";
import SettingsDrawer, { crudApiMapping } from "@/components/settings/SettingsDrawer";

import {
  ArrowLeft,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Mail,
  MessageSquare,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Server,
  Lock,
  Section
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import ConfirmationMessageToast from "@/components/ui/confirmationMessageToast";
import { useNotify } from "@/components/ui/NotificationProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AssignProjectsForm from "@/components/settings/AssignProjectsForm";
import { Item } from "@radix-ui/react-dropdown-menu";

// Tab configuration
const settingsTabs = [
  {
    id: 'user-management',
    label: 'User Management',
    icon: SettingsIcon,
    description: 'Manage users, roles, and permissions',
    disabled: false
  },
];

// Section titles and descriptions for drawer
const sectionInfo: Record<string, { title: string; description: string }> = {
  // User Management
  'users': { title: 'Users', description: 'Manage user with project access' },
};

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('user-management');

  // Drawer states
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [drawerType, setDrawerType] = useState<'user' | 'metadata'>('user');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Set page title
  usePageTitle("Settings - Company Smart Hiring");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Assign Projects Dialog state
  const [showAssignProjectDialog, setShowAssignProjectDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { notify } = useNotify();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const crudApi = crudApiMapping[selectedSection];
      if (!crudApi) throw new Error(`No CRUD API found for section: ${selectedSection}`);
      return crudApi.delete(id);
    },
    onSuccess: (data: any) => {
      notify(data.message || "Item deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: [selectedSection] });
      setShowConfirmation(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      notify(error.message || "Failed to delete item", "error");
      console.error('Delete error:', error);
      setShowConfirmation(false);
      setItemToDelete(null);
    },
  });

  // Handler functions
  const handleOpenDrawer = (section: string, type: 'user' | 'metadata') => {
    setSelectedSection(section);
    setDrawerType(type);
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setSelectedSection('');
  };

  const handleAssignPermissions = (user: any) => {
    setSelectedUser(user);
    setShowAssignProjectDialog(true);
  };

  const handleCloseAssignPermissions = () => {
    setShowAssignProjectDialog(false);
    setSelectedUser(null);
  };

  const handleConfirmationClose = useCallback(() => {
    setShowConfirmation(false);
    setItemToDelete(null);
  }, []);

  const handleDeleteClick = (item: any, section: string) => {
    setSelectedSection(section);
    setItemToDelete(item);
    setShowConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const renderUserManagement = () => (
    <UserManagement
      onOpenDrawer={(section) => handleOpenDrawer(section, 'user')}
      onEditItem={(item, section) => {
        setSelectedItem(item);
        setSelectedSection(section);
        setDrawerType('user');
        setIsEditing(true);
        setIsCreating(false);
        setOpenDrawer(true);
      }}
      onDeleteItem={(item, section) => {
        handleDeleteClick(item, section)
      }}
      onCreateItem={(section) => {
        setSelectedItem(null);
        setIsEditing(false);
        setIsCreating(true);
        setSelectedSection(section);
        setDrawerType('user');
        setOpenDrawer(true);
      }}
      onAssignPermissions={handleAssignPermissions}
    />
  );

  const renderTabContent = () => {
    // Check if the current tab is disabled
    const currentTab = settingsTabs.find(tab => tab.id === activeTab);
    if (currentTab?.disabled) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <SettingsIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {currentTab.label} Coming Soon
          </h3>
          <p className="text-muted-foreground max-w-md">
            This feature is currently under development and will be available in a future update.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'user-management':
        return renderUserManagement();
      default:
        return renderUserManagement();
    }
  };

  return (
    <div className="min-h-screen bg-background fixed inset-0 overflow-hidden">
      {/* Full Screen Header */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/projects')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to projects</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#0d9488]" />
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Settings</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Manage users
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 overflow-x-auto">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center space-x-2 py-2 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${tab.disabled
                  ? 'border-transparent text-muted-foreground/50 cursor-not-allowed opacity-50'
                  : activeTab === tab.id
                    ? 'border-[#0d9488] text-[#0d9488]'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 h-[calc(100vh-140px)] overflow-y-auto">
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={openDrawer}
        onClose={handleCloseDrawer}
        section={selectedSection}
        sectionTitle={sectionInfo[selectedSection]?.title || 'Settings'}
        sectionDescription={sectionInfo[selectedSection]?.description || 'Manage settings'}
        type={drawerType}
        isCreating={isCreating}
        isEditing={isEditing}
        selectedItem={selectedItem}
      />

      <ConfirmationMessageToast
        open={showConfirmation}
        onClose={handleConfirmationClose}
        onSubmit={() => {
          if (itemToDelete) {
            handleDeleteConfirm();
          }
        }}
        cancelButtonLabel="Cancel"
        submitButtonLabel="Delete"
        confirmationMessage={`Are you sure you want to delete this ${sectionInfo[selectedSection]?.title?.replace(/s$/, "") || 'Settings'} item?`}
        heading="Delete Item"
      />

      {/* Assign Projects Drawer */}
      <AssignProjectsForm
        isOpen={showAssignProjectDialog}
        onClose={handleCloseAssignPermissions}
        user={selectedUser}
      />
    </div>
  );
}