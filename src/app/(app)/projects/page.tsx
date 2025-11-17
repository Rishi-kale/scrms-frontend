"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsAPI, LeadSummary } from "@/lib/api-services";
import { ProjectDetailsDrawer } from "@/components/leads/ProjectDetailsDrawer";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  User,
  Users,
  Building2,
  CheckCircle,
  AlertCircle,
  Circle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { PROJECT_HEALTH } from "../constant";
import { no } from "zod/v4/locales";
import { useNotify } from "@/components/ui/NotificationProvider";

type SortField = "customer" | "title" | "projectManager" | "teamSize" | "projectHealth";
type SortOrder = "asc" | "desc";

// Define type for health filter option
type HealthFilterOption = {
  value: string;
  label: string;
  icon?: React.ComponentType<any>; // Icon is optional
};

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState<string | "all">("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { notify } = useNotify();
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["leads", { status: "Won" }],
    queryFn: () => leadsAPI.fetchAll({ status: "Won" }),
    staleTime: 10 * 1000,
    retry: 2,
  });

  const projects: LeadSummary[] = useMemo(() => {
    if (!data?.data) return [];
    return (Array.isArray(data.data) ? data.data : []) as LeadSummary[];
  }, [data]);

  // Client-side filtering and sorting
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(
        (project) =>
          project.title?.toLowerCase().includes(searchLower) ||
          project.customer?.name?.toLowerCase().includes(searchLower) ||
          project.projectManager?.toLowerCase().includes(searchLower)
      );
    }

    // Apply project health filter
    if (healthFilter !== "all") {
      result = result.filter((project) => project.projectHealth === healthFilter);
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortField) {
          case "customer":
            aVal = a.customer?.name || "";
            bVal = b.customer?.name || "";
            break;
          case "title":
            aVal = a.title || "";
            bVal = b.title || "";
            break;
          case "projectManager":
            aVal = a.projectManager || "";
            bVal = b.projectManager || "";
            break;
          case "teamSize":
            aVal = a.teamSize || 0;
            bVal = b.teamSize || 0;
            // Numeric comparison for team size
            return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
          case "projectHealth":
            aVal = a.projectHealth || "";
            bVal = b.projectHealth || "";
            break;
        }

        const comparison = String(aVal).localeCompare(String(bVal));
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [projects, debouncedSearch, healthFilter, sortField, sortOrder]);

  // Pagination
  const paginatedProjects = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredAndSortedProjects.slice(startIndex, startIndex + limit);
  }, [filteredAndSortedProjects, page, limit]);

  const totalPages = Math.ceil(filteredAndSortedProjects.length / limit);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setHealthFilter("all");
    setSortField(null);
    setSortOrder("asc");
    setPage(1);
  };

  const hasActiveFilters = debouncedSearch || healthFilter !== "all" || sortField;

  const headers: Array<{ key: SortField; label: string; sortable: boolean }> = useMemo(
    () => [
      { key: "customer", label: "Customer Name", sortable: true },
      { key: "title", label: "Project Name", sortable: true },
      { key: "projectManager", label: "Project Manager", sortable: true },
      { key: "teamSize", label: "Team Size", sortable: true },
      { key: "projectHealth", label: "Project Health", sortable: true },
    ],
    []
  );

  // Reusable status badge component
  const getStatusBadge = (status: string) => {
    const statusConfig = PROJECT_HEALTH.find(s => s.value === status);
    const Icon = statusConfig?.icon || Circle;

    return (
      <Badge
        variant="secondary"
        className={`${statusConfig?.color || 'bg-gray-100 text-gray-800'} flex items-center gap-1 px-3 py-1`}
      >
        <Icon className="h-3 w-3" />
        {statusConfig?.label || status}
      </Badge>
    );
  };

  // Health filter options with proper typing
  const healthFilterOptions: HealthFilterOption[] = [
    { value: "all", label: "All Health Status" },
    ...PROJECT_HEALTH.map(status => ({
      value: status.value,
      label: status.label,
      icon: status.icon
    }))
  ];

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Won leads converted to projects
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Add any action buttons here if needed */}
        </div>
      </div>

      {/* Compact Search and Filters */}
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium">Search & Filters</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-xs"
          >
            Clear All
          </Button>
        </div>

        {/* Search and Quick Filters Row */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 mb-3">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>

          {/* Health Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full sm:w-auto min-w-[120px] h-8 justify-between"
              >
                {healthFilter === "all"
                  ? "Health Status"
                  : PROJECT_HEALTH.find(s => s.value === healthFilter)?.label || healthFilter}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search health status..." />
                <CommandGroup>
                  {healthFilterOptions.map((option) => {
                    const Icon = option.icon; // Icon might be undefined
                    return (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer hover:bg-accent"
                        onClick={() => setHealthFilter(option.value)}
                      >
                        <Checkbox
                          checked={healthFilter === option.value}
                          onChange={() => { }}
                        />
                        {Icon && <Icon className="h-4 w-4" />}
                        <span className="text-sm">{option.label}</span>
                      </div>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Sort Control */}
          <Select value={sortField || "none"} onValueChange={(value) => {
            if (value === "none") {
              setSortField(null);
            } else {
              setSortField(value as SortField);
            }
          }}>
            <SelectTrigger className="w-full sm:w-auto min-w-[120px] h-8">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Sorting</SelectItem>
              <SelectItem value="customer">Customer Name</SelectItem>
              <SelectItem value="title">Project Name</SelectItem>
              <SelectItem value="projectManager">Project Manager</SelectItem>
              <SelectItem value="teamSize">Team Size</SelectItem>
              <SelectItem value="projectHealth">Project Health</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-8 px-2"
          >
            {sortOrder === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          </Button>
        </div>
      </Card>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {filteredAndSortedProjects.length} of {projects.length} projects</span>
            {debouncedSearch && (
              <Badge variant="secondary" className="text-xs bg-[#0d9488] text-white border-[#0d9488]">
                Search: "{debouncedSearch}"
              </Badge>
            )}
            {healthFilter !== "all" && (
              <Badge variant="secondary" className="text-xs bg-[#0d9488] text-white border-[#0d9488]">
                Health: {PROJECT_HEALTH.find(s => s.value === healthFilter)?.label || healthFilter}
              </Badge>
            )}
          </div>
          {sortField && (
            <div className="text-sm text-muted-foreground">
              Sorted by {headers.find(h => h.key === sortField)?.label} ({sortOrder})
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          Failed to load projects. Please try again.
        </div>
      )}

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            {isLoading ? (
              'Loading projects...'
            ) : projects.length > 0 ? (
              <>
                {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''} found
                {totalPages > 1 && ` • Page ${page} of ${totalPages}`}
                {limit !== 10 && ` • Showing ${limit} per page`}
              </>
            ) : (
              'No projects found. Projects are created from won leads.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading projects...</span>
              </div>
            </div>
          ) : paginatedProjects.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                Projects are created automatically when leads are marked as won.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedProjects.map((project) => (
                <Card
                  key={project._id}
                  className="group hover:bg-accent/50 transition-colors duration-200 border border-border rounded-lg !py-0 cursor-pointer"
                  onClick={() => setSelectedProjectId(project._id)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Left side - Avatar, Customer, Project Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-medium text-sm sm:text-base text-primary uppercase">
                          {(project.customer?.name || "-").charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-2">
                            <div className="min-w-0">
                              {/* Customer Name */}
                              <div className="font-semibold text-base sm:text-lg truncate">
                                {project.customer?.name || "-"}
                              </div>
                              {/* Project Title */}
                              <div className="text-sm text-muted-foreground truncate">
                                {project.title}
                              </div>
                            </div>
                            {/* Project Manager and Team Size */}
                            <div className="text-sm text-muted-foreground truncate">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <User className="h-3.5 w-3.5" />
                                  PM: {project.projectManager || "Not assigned"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {project.teamSize || "0"} team members
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Status and Actions */}
                      <div className="flex items-center justify-center sm:justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={project.projectHealth || 'Good'}
                          onValueChange={async (value) => {
                            const newHealth = value as 'Good' | 'Moderate' | 'AT Risk';
                            try {
                              await leadsAPI.update(project._id, { projectHealth: newHealth });
                              queryClient.invalidateQueries({ queryKey: ["leads", { status: "Won" }] });
                            } catch (error) {
                              console.error("Failed to update project health:", error);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue>
                              {getStatusBadge(project.projectHealth || 'Good')}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {PROJECT_HEALTH.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const Icon = status.icon;
                                    return <Icon className="h-3 w-3" />;
                                  })()}
                                  {status.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs flex-1 sm:flex-none justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProjectId(project._id);
                          }}
                        >
                          View Details
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs flex-1 sm:flex-none justify-center"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await leadsAPI.syncLeadToJobs(project._id);
                              notify("Lead synced to jobs service successfully", "success");
                            } catch (error) {
                              notify("Failed to sync lead to jobs service", "error");
                              console.error("Failed to sync lead to jobs service:", error);
                            }
                          }}
                        >
                          Go to Floor
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {!isLoading && paginatedProjects.length > 0 && totalPages > 1 && (
          <CardFooter className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                {filteredAndSortedProjects.length > 0 ? (
                  <>
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, filteredAndSortedProjects.length)} of {filteredAndSortedProjects.length} projects
                    {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
                  </>
                ) : (
                  'No projects found'
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {/* First page */}
                    {page > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setPage(1)}
                            className="cursor-pointer"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {page > 4 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}

                    {/* Page numbers around current page */}
                    {(() => {
                      let startPage, endPage;

                      if (totalPages <= 5) {
                        // If 5 or fewer pages, show all pages
                        startPage = 1;
                        endPage = totalPages;
                      } else {
                        // Show 5 pages centered around current page when possible
                        startPage = Math.max(1, page - 2);
                        endPage = Math.min(totalPages, startPage + 4);

                        // Adjust start if we're near the end
                        if (endPage === totalPages) {
                          startPage = Math.max(1, endPage - 4);
                        }
                      }

                      const pages = [];
                      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
                        pages.push(
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={pageNum === page}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      return pages;
                    })()}

                    {/* Last page */}
                    {page < totalPages - 2 && (
                      <>
                        {page < totalPages - 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setPage(totalPages)}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <div className="flex items-center space-x-4">
                  {/* Page size selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Show:</span>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => {
                        setLimit(Number(value));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">per page</span>
                  </div>

                  {/* Go to page input */}
                  {totalPages > 5 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Go to:</span>
                      <Input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={page}
                        onChange={(e) => {
                          const newPage = parseInt(e.target.value);
                          if (newPage >= 1 && newPage <= totalPages) {
                            setPage(newPage);
                          }
                        }}
                        className="w-16 h-8 text-center"
                        placeholder={page.toString()}
                      />
                      <span className="text-sm text-muted-foreground">of {totalPages}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>

      <ProjectDetailsDrawer
        projectId={selectedProjectId}
        open={!!selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
      />
    </div>
  );
}