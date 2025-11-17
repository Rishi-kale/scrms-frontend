"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, X } from "lucide-react";
import { adminAPI, metaAPI } from "@/lib/api-services";
import { useNotify } from "@/components/ui/NotificationProvider";
import type { Project as BaseProject, Customer as APICustomer } from '@/lib/api-services';

// Define local Customer type with _id
interface Customer extends APICustomer {
  _id: string;
  name: string;
}

// Extend the Project type to include required fields
interface ProjectWithCustomer extends BaseProject {
  _id: string;
  customerId: string;
  title?: string;
}

interface ProjectsResponse {
  data: {
    leads: ProjectWithCustomer[];
  };
}

interface AssignProjectsFormProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    customerIds?: string[];
    projectIds?: string[];
  } | null;
}

export default function AssignProjectsForm({
  isOpen,
  onClose,
  user,
}: AssignProjectsFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const { notify } = useNotify();
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customersResponse, isLoading: customersLoading } = useQuery<any>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await metaAPI.getCustomers();
      return response;
    },
    enabled: isOpen,
  });

  const customers = customersResponse?.data || [];

  // Fetch projects based on selected customer
  const { data: projectsResponse, isLoading: projectsLoading } = useQuery<ProjectsResponse>({
    queryKey: ["projects", selectedCustomer],
    queryFn: async () => {
      if (!selectedCustomer) return { data: { leads: [] } };

      const response = await adminAPI.getProjectsByCustomer(selectedCustomer);
      return response as ProjectsResponse;
    },
    enabled: isOpen && !!selectedCustomer,
  });

  // Extract projects from the 'leads' array in the response
  const projects = (projectsResponse?.data?.leads || []) as ProjectWithCustomer[];

  // Initialize selections when user changes
  useEffect(() => {
    if (user) {
      const initialCustomer = user.customerIds && user.customerIds.length > 0 ? user.customerIds[0] : null;
      setSelectedCustomer(initialCustomer);
      setSelectedProjects(user.projectIds || []);
    } else {
      setSelectedCustomer(null);
      setSelectedProjects([]);
    }
  }, [user]);

  // Mutation for assigning projects - changed projectIds to leadIds
  const assignMutation = useMutation({
    mutationFn: async (data: { userId: string; leadIds: string[] }) => {
      const response = await adminAPI.assignProjectsToUser(data);
      return response;
    },
    onSuccess: (response: any) => {
      notify(response?.message || "Projects assigned successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Reset form and close
      setSelectedCustomer(null);
      setSelectedProjects([]);
      onClose();
    },
    onError: (error: any) => {
      console.error('Assignment error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to assign projects";
      notify(errorMessage, "error");
    },
  });

  const handleAddProject = (projectId: string) => {
    if (projectId && !selectedProjects.includes(projectId)) {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const handleRemoveProject = (projectId: string) => {
    setSelectedProjects(selectedProjects.filter(id => id !== projectId));
  };

  const handleSave = () => {
    if (!user) {
      notify("No user selected", "error");
      return;
    }

    if (!selectedCustomer) {
      notify("Please select a customer", "error");
      return;
    }

    if (selectedProjects.length === 0) {
      notify("Please select at least one project", "error");
      return;
    }

    // Changed projectIds to leadIds to match API expectation
    assignMutation.mutate({
      userId: user.id,
      leadIds: selectedProjects,
    });
  };

  const handleClose = () => {
    if (!assignMutation.isPending) {
      setSelectedCustomer(null);
      setSelectedProjects([]);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:w-[65vw] md:w-[55vw] lg:w-[50vw] xl:w-[53vw] !max-w-[700px] overflow-y-auto">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-xl font-semibold">
            Assign Projects to User
          </SheetTitle>
          <SheetDescription className="mt-1">
            Select a customer and their projects for <span className="font-semibold text-foreground">{user?.name}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 px-6 py-6">
          {/* Customer Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Select Customer</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedCustomer ? "1 selected" : "0 selected"}
              </Badge>
            </div>

            <Select
              value={selectedCustomer || ""}
              onValueChange={(value) => {
                setSelectedCustomer(value || null);
                // Clear projects when customer changes
                setSelectedProjects([]);
              }}
              disabled={customersLoading}
            >
              <SelectTrigger className="w-full shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
                <SelectValue placeholder={customersLoading ? "Loading customers..." : "Select a customer..."} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] z-[9999]" position="popper">
                {customers?.length > 0 ? (
                  customers.map((customer: Customer) => (
                    <SelectItem
                      key={customer._id}
                      value={customer._id}
                    >
                      {customer.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">No customers available</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Project Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Select Projects</h3>
                <p className="text-xs text-gray-500 mt-1">Based on selected customer</p>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {selectedProjects.length} selected
              </Badge>
            </div>

            <div className="flex gap-2">
              <Select
                value=""
                onValueChange={handleAddProject}
                disabled={!selectedCustomer || projectsLoading || projects.length === 0}
              >
                <SelectTrigger className="flex-1 shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
                  <SelectValue placeholder={
                    !selectedCustomer
                      ? "Select a customer first"
                      : projectsLoading
                        ? "Loading projects..."
                        : projects.length === 0
                          ? "No projects available"
                          : "Select a project..."
                  } />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] z-[9999]" position="popper">
                  {projects.length > 0 ? (
                    projects.map((project: ProjectWithCustomer) => (
                      <SelectItem
                        key={project._id}
                        value={project._id}
                        disabled={selectedProjects.includes(project._id)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{project.title || 'Untitled Project'}</span>
                          {selectedProjects.includes(project._id) && (
                            <Badge variant="secondary" className="ml-2 text-xs">Selected</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No projects available</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Projects */}
            {selectedProjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedProjects.map((projectId) => {
                  const project = projects.find((p: ProjectWithCustomer) => p._id === projectId);
                  return (
                    <Badge
                      key={projectId}
                      variant="secondary"
                      className="px-3 py-1 flex items-center gap-2"
                      style={{
                        backgroundColor: '#0d9488',
                        color: 'white',
                        borderColor: '#0d9488'
                      }}
                    >
                      <span>{project?.title || projectId}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(projectId)}
                        className="hover:text-red-200 transition-colors"
                        aria-label="Remove project"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Message */}
          {!selectedCustomer && (
            <div className="text-center py-8 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600">Please select a customer to view available projects</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-background">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={assignMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#0d9488] hover:bg-[#0d9488]/90"
            onClick={handleSave}
            disabled={assignMutation.isPending || !selectedCustomer || selectedProjects.length === 0}
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Assign Projects
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}