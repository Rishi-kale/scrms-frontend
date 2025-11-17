"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsAPI, LeadSummary, LeadStatus, metaAPI } from "@/lib/api-services";
import { useUser } from "@/lib/user-context";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Loader2, Search, Plus, Filter, X, Building2, FileText, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
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
import { LeadDetailsDrawer } from "@/components/leads/LeadDetailsDrawer";
import { useNotify } from "@/components/ui/NotificationProvider";

const STATUS_STYLES: Record<LeadStatus, string> = {
  "New": "bg-blue-100 text-blue-800 hover:bg-blue-200",
  "Contacted": "bg-amber-100 text-amber-800 hover:bg-amber-200",
  "Follow-up": "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  "Proposal Sent": "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
  "In Negotiation": "bg-purple-100 text-purple-800 hover:bg-purple-200",
  "Won": "bg-green-100 text-green-800 hover:bg-green-200",
  "Lost": "bg-red-100 text-red-800 hover:bg-red-200",
  "On-hold": "bg-gray-200 text-gray-800 hover:bg-gray-300",
};

const ALL_SOURCES = [
  "Website",
  "Referral",
  "Social Media",
  "Email",
  "Cold Call",
  "Advertisement",
  "Other",
];

const ALL_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Follow-up",
  "Proposal Sent",
  "In Negotiation",
  "Won",
  "Lost",
  "On-hold",
];

type SortField = "customer" | "title" | "createdBy" | "source" | "status";
type SortOrder = "asc" | "desc";

export default function LeadsPage() {
  const { user } = useUser();
  const { notify } = useNotify();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [updatingLeads, setUpdatingLeads] = useState<Set<string>>(new Set());
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["leads", { page, limit, status: statusFilter !== "all" ? statusFilter : undefined, source: sourceFilter !== "all" ? sourceFilter : undefined }],
    queryFn: () => leadsAPI.fetchAll({
      page,
      limit,
      status: statusFilter !== "all" ? statusFilter : undefined,
      source: sourceFilter !== "all" ? sourceFilter : undefined
    }),
    placeholderData: (previousData) => previousData,
    staleTime: 10 * 1000,
    retry: 2,
  });

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setSourceFilter("all");
    setSortField(null);
    setSortOrder("asc");
    setPage(1);
  };

  const leads = useMemo(() => {
    if (!data?.data) return [];
    return (Array.isArray(data.data) ? data.data : []) as LeadSummary[];
  }, [data]);

  const totalItems = (data as any)?.meta?.total || leads?.length || 0;
  const totalPages = (data as any)?.meta?.totalPages || Math.ceil(totalItems / limit) || 1;

  // Client-side filtering and sorting
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.title?.toLowerCase().includes(searchLower) ||
          lead.customer?.name?.toLowerCase().includes(searchLower) ||
          lead.description?.toLowerCase().includes(searchLower) ||
          lead.createdBy?.toLowerCase().includes(searchLower) ||
          lead.source?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((lead) => lead.status === statusFilter);
    }

    // Apply source filter
    if (sourceFilter !== "all") {
      result = result.filter((lead) => lead.source === sourceFilter);
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        let aVal: string | undefined;
        let bVal: string | undefined;

        switch (sortField) {
          case "customer":
            aVal = a.customer?.name;
            bVal = b.customer?.name;
            break;
          case "title":
            aVal = a.title;
            bVal = b.title;
            break;
          case "createdBy":
            aVal = a.createdBy;
            bVal = b.createdBy;
            break;
          case "source":
            aVal = a.source;
            bVal = b.source;
            break;
          case "status":
            aVal = a.status;
            bVal = b.status;
            break;
        }

        // Handle undefined values
        if (aVal === undefined && bVal === undefined) return 0;
        if (aVal === undefined) return sortOrder === "asc" ? 1 : -1;
        if (bVal === undefined) return sortOrder === "asc" ? -1 : 1;

        const comparison = aVal.localeCompare(bVal);
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [leads, debouncedSearch, statusFilter, sourceFilter, sortField, sortOrder]);

  // Mutation for updating lead status
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, newStatus, currentLead, userName }: {
      leadId: string;
      newStatus: LeadStatus;
      currentLead: LeadSummary;
      userName: string;
    }) => {
      return leadsAPI.update(leadId, {
        title: currentLead.title,
        description: currentLead.description || "",
        source: currentLead.source || "",
        status: newStatus,
        updatedBy: userName,
      });
    },
    onSuccess: async (response, { leadId, newStatus }) => {
      // When status is changed to "Won", the lead automatically becomes a project
      if (newStatus === "Won") {
        notify("Lead status updated to Won - it will now appear in Projects tab", "success");
      } else {
        notify(`Lead status updated to ${newStatus}`, "success");
      }

      // Refresh leads data
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      // Also refresh projects data (won leads)
      queryClient.invalidateQueries({ queryKey: ["leads", { status: "Won" }] });
      setUpdatingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    },
    onError: (error: any, { leadId }) => {
      console.error("Failed to update lead status:", error);

      // Handle specific error cases
      let errorMessage = "Failed to update lead status";

      if (error?.response?.status === 404) {
        errorMessage = "Lead not found";
      } else if (error?.response?.status === 400) {
        errorMessage = "Invalid lead data provided";
      } else if (error?.response?.status === 401) {
        errorMessage = "Unauthorized - please login again";
      } else if (error?.response?.status === 500) {
        errorMessage = "Server error - please try again later";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      notify(errorMessage, "error");
      setUpdatingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    },
  });

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    if (!leadId || !newStatus) {
      notify("Invalid lead data", "error");
      return;
    }

    // Find the current lead
    const currentLead = filteredAndSortedLeads.find(lead => lead._id === leadId);
    if (!currentLead) {
      notify("Lead not found", "error");
      return;
    }

    setUpdatingLeads(prev => new Set(prev).add(leadId));
    updateLeadStatusMutation.mutate({
      leadId,
      newStatus,
      currentLead,
      userName: user?.name || user?.id || "current-user"
    });
  };

  const canEditLead = useCallback(
    (lead: LeadSummary) => {
      if (!user) return false;
      const isAdmin = user.userRoles?.some(
        (r) => (r.role?.key || "").toLowerCase() === "admin"
      );
      const isCreator = lead.createdBy === user.name;
      return isAdmin || isCreator;
    },
    [user]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const hasActiveFilters = debouncedSearch || statusFilter !== "all" || sourceFilter !== "all" || sortField;

  const headers: Array<{ key: SortField; label: string; sortable: boolean }> = useMemo(
    () => [
      { key: "customer" as SortField, label: "Customer Name", sortable: true },
      { key: "title" as SortField, label: "Lead Title", sortable: true },
      { key: "createdBy" as SortField, label: "Created By", sortable: true },
      { key: "source" as SortField, label: "Source", sortable: true },
      { key: "status" as SortField, label: "Status", sortable: true },
    ],
    []
  );

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage and track your sales leads
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button asChild className="flex-1 sm:flex-none">
            <Link href="/leads/create" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Lead</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </Button>
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
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>

          {/* Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full sm:w-auto min-w-[120px] h-8 justify-between"
              >
                {statusFilter === "all"
                  ? "Status"
                  : statusFilter}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search status..." />
                <CommandGroup>
                  <div
                    className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer hover:bg-accent"
                    onClick={() => setStatusFilter("all")}
                  >
                    <Checkbox
                      checked={statusFilter === "all"}
                      onChange={() => { }}
                    />
                    <span className="text-sm">All Statuses</span>
                  </div>
                  {ALL_STATUSES.map((status) => (
                    <div
                      key={status}
                      className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer hover:bg-accent"
                      onClick={() => setStatusFilter(status)}
                    >
                      <Checkbox
                        checked={statusFilter === status}
                        onChange={() => { }}
                      />
                      <span className="text-sm">{status}</span>
                    </div>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Source Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full sm:w-auto min-w-[120px] h-8 justify-between"
              >
                {sourceFilter === "all"
                  ? "Source"
                  : sourceFilter}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search sources..." />
                <CommandGroup>
                  <div
                    className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer hover:bg-accent"
                    onClick={() => setSourceFilter("all")}
                  >
                    <Checkbox
                      checked={sourceFilter === "all"}
                      onChange={() => { }}
                    />
                    <span className="text-sm">All Sources</span>
                  </div>
                  {ALL_SOURCES.map((source) => (
                    <div
                      key={source}
                      className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer hover:bg-accent"
                      onClick={() => setSourceFilter(source)}
                    >
                      <Checkbox
                        checked={sourceFilter === source}
                        onChange={() => { }}
                      />
                      <span className="text-sm">{source}</span>
                    </div>
                  ))}
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
              <SelectItem value="title">Lead Title</SelectItem>
              <SelectItem value="createdBy">Created By</SelectItem>
              <SelectItem value="source">Source</SelectItem>
              <SelectItem value="status">Status</SelectItem>
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
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span>Showing {filteredAndSortedLeads.length} of {totalItems} leads</span>
            {debouncedSearch && (
              <Badge variant="secondary" className="text-xs bg-[#0d9488] text-white border-[#0d9488]">
                Search: "{debouncedSearch}"
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="text-xs bg-[#0d9488] text-white border-[#0d9488]">
                Status: {statusFilter}
              </Badge>
            )}
            {sourceFilter !== "all" && (
              <Badge variant="secondary" className="text-xs bg-[#0d9488] text-white border-[#0d9488]">
                Source: {sourceFilter}
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
          Failed to load leads. Please try again.
        </div>
      )}

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            {isLoading ? (
              'Loading leads...'
            ) : totalItems > 0 ? (
              <>
                {totalItems} lead{totalItems !== 1 ? 's' : ''} found
                {totalPages > 1 && ` • Page ${page} of ${totalPages}`}
                {limit !== 10 && ` • Showing ${limit} per page`}
              </>
            ) : (
              'No leads found. Get started by adding your first lead.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading leads...</span>
              </div>
            </div>
          ) : filteredAndSortedLeads.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leads found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first lead.
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/leads/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Lead
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedLeads.map((lead, index) => (
                <Card
                  key={lead._id || `lead-${index}`}
                  className="group hover:bg-accent/50 transition-colors duration-200 border border-border rounded-lg !py-0 cursor-pointer"
                  onClick={() => setSelectedLeadId(lead._id)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Left side - Avatar, Customer, Lead Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-medium text-sm sm:text-base text-primary uppercase">
                          {(lead.customer?.name || "-").charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-2">
                            <div className="min-w-0">
                              {/* Customer Name */}
                              <div className="font-semibold text-base sm:text-lg truncate">
                                {lead.customer?.name || "-"}
                              </div>
                              {/* Lead Title */}
                              <div className="text-sm text-muted-foreground truncate">
                                {lead.title}
                              </div>
                            </div>
                            {/* Source and Description */}
                            <div className="text-sm text-muted-foreground truncate">
                              {lead.source || "No source"} • Created by {lead.createdBy}
                            </div>
                            {lead.description && (
                              <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                                {lead.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side - Status and Actions */}
                      <div className="flex items-center justify-center sm:justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={lead.status}
                          onValueChange={(newStatus) => handleStatusChange(lead._id, newStatus as LeadStatus)}
                          disabled={updatingLeads.has(lead._id)}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ALL_STATUSES.map((status, index) => (
                              <SelectItem key={`${lead._id}-${status}-${index}`} value={status}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${STATUS_STYLES[status].split(' ')[0].replace('bg-', 'bg-')}`} />
                                  {status}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {updatingLeads.has(lead._id) && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs flex-1 sm:flex-none justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLeadId(lead._id);
                          }}
                        >
                          View Details
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
        {!isLoading && filteredAndSortedLeads.length > 0 && totalPages > 1 && (
          <CardFooter className="pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                {totalItems > 0 ? (
                  <>
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} leads
                    {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
                  </>
                ) : (
                  'No leads found'
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

      <LeadDetailsDrawer
        leadId={selectedLeadId}
        open={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}