"use client";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
// Additional Shadcn/ui imports for user form
import { Switch } from "@/components/ui/switch";
import {
  Users,
  UserCheck,
  Key,
  FileText,
  Briefcase,
  Building,
  Code,
  MapPin,
  GraduationCap,
  Globe,
  Star,
  Zap,
  Award,
  Heart,
  Edit,
  Trash2,
  Plus,
  X,
  Save,
  Loader2,
  Check,
  ChevronsUpDown
} from "lucide-react";
import { jobsMetaAPI, adminAPI } from "@/lib/api-services";
import { useNotify } from "../ui/NotificationProvider";
import ConfirmationMessageToast from "../ui/confirmationMessageToast";

// Icon mapping for different sections
const sectionIcons: Record<string, any> = {
  // User Management
  'users': Users,
  // 'roles': UserCheck,
  // 'permissions': Key,
  // Meta Data Management
};

// API mapping for different sections
const apiMapping: Record<string, () => Promise<any>> = {
  // User Management APIs
  'users': () => adminAPI.getAllUsers(),
};

// CRUD API mapping for create, update, delete operations
export const crudApiMapping: Record<string, {
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  delete: (id: string) => Promise<any>;
}> = {
  // User Management CRUD
  'users': {
    create: (data) => adminAPI.createUser(data),
    update: (id, data) => adminAPI.updateUser(id, data),
    delete: (id) => adminAPI.deleteUser(id),
  },
};

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  sectionTitle: string;
  sectionDescription: string;
  type: 'user' | 'metadata';
  isCreating?: boolean;
  isEditing?: boolean;
  selectedItem?: any;
}

export default function SettingsDrawer({
  isOpen,
  onClose,
  section,
  sectionTitle,
  sectionDescription,
  type,
  isCreating: propIsCreating = false,
  isEditing: propIsEditing = false,
  selectedItem: propSelectedItem = null
}: SettingsDrawerProps) {
  const [isEditing, setIsEditing] = useState(propIsEditing);
  const [isCreating, setIsCreating] = useState(propIsCreating);
  const [selectedItem, setSelectedItem] = useState<any>(propSelectedItem);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const queryClient = useQueryClient();
  const { notify } = useNotify();



  // Reset states when drawer closes or props change
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setIsCreating(false);
      setSelectedItem(null);
      setSelectedRoles([]);
      setShowConfirmation(false);
      setItemToDelete(null);
    } else {
      // Update states when props change
      setIsEditing(propIsEditing);
      setIsCreating(propIsCreating);
      setSelectedItem(propSelectedItem);

    }
  }, [isOpen, propIsEditing, propIsCreating, propSelectedItem, section]);

  // Fetch data based on section
  const { data, isLoading, error } = useQuery({
    queryKey: [section],
    queryFn: apiMapping[section] || (() => Promise.resolve({ data: { items: [] } })),
    enabled: isOpen && !!apiMapping[section],
  });

  // Mutation hooks for CRUD operations
  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const crudApi = crudApiMapping[section];
      if (!crudApi) throw new Error(`No CRUD API found for section: ${section}`);
      return crudApi.create(data);
    },
    onSuccess: () => {
      notify(data?.message, "success");
      queryClient.invalidateQueries({ queryKey: [section] });
      setIsCreating(false);
      setSelectedItem(null);
      onClose(); // Close the drawer after successful creation
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      notify(error.message || "Failed to create item", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      const crudApi = crudApiMapping[section];
      if (!crudApi) throw new Error(`No CRUD API found for section: ${section}`);
      return crudApi.update(id, data);
    },
    onSuccess: (data: any) => {
      notify(data?.message, "success");
      queryClient.invalidateQueries({ queryKey: [section] });
      setIsEditing(false);
      setSelectedItem(null);
      onClose(); // Close the drawer after successful update
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      notify(error?.message || "Failed to update item", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const crudApi = crudApiMapping[section];
      if (!crudApi) throw new Error(`No CRUD API found for section: ${section}`);
      return crudApi.delete(id);
    },
    onSuccess: (data: any) => {
      notify(data.message || "Item deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: [section] });
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

  // Extract items from API response - handle different response structures
  const getItemsFromResponse = (response: any) => {
    if (!response?.data) return [];
    // Handle different response structures
    if (response.data.users) return response.data.users; // Users API
    if (Array.isArray(response.data)) return response.data; // Direct array response
    return [];
  };

  const items = getItemsFromResponse(data);


  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setIsEditing(true);
    setIsCreating(false);
    setItemToDelete(null);
    // Set selected roles for editing
    if (section === 'users' && item.userRoles) {
      setSelectedRoles(item.userRoles.map((role: any) => role.roleId || role.id));
    } else {
      setSelectedRoles([]);
    }
  };

  const handleCreateItem = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setIsCreating(true);
    setSelectedRoles([]);
    setItemToDelete(null);
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setShowConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const handleSave = (data: any) => {
    if (isCreating) {
      createMutation.mutate(data);
    } else if (isEditing && selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data });
    }
  };


  // Handle confirmation dialog close
  const handleConfirmationClose = useCallback(() => {
    setShowConfirmation(false);
    setItemToDelete(null);
  }, []);

  const IconComponent = sectionIcons[section] || FileText;

  return (
    <Sheet open={isOpen} onOpenChange={onClose} >
      <SheetContent className="w-full sm:max-w-md overflow-y-auto z-100">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            {sectionTitle}
          </SheetTitle>
          <SheetDescription>
            {sectionDescription}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">

          {/* Create/Edit Form */}
          <>
            {/* Back to List Button */}

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {isCreating ? 'Create New' : isEditing ? 'Edit' : 'Create New'} {sectionTitle}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  {isCreating ? 'Add a new item to the system' : isEditing ? 'Update the selected item' : 'Add a new item to the system'}
                </CardDescription>
              </CardHeader>
            </Card>
          </>
        </div>

        {/* Confirmation Dialog */}
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
          confirmationMessage="Are you sure you want to delete this item?"
          heading="Delete Item"
        />
      </SheetContent>
    </Sheet>
  );
}