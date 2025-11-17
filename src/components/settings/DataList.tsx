"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Key
} from "lucide-react";
import { jobsMetaAPI, adminAPI } from "@/lib/api-services";

// API mapping for different sections
const apiMapping: Record<string, () => Promise<any>> = {
  // User Management APIs
  'users': () => adminAPI.getAllUsers(),
};

interface DataListProps {
  section: string;
  sectionTitle: string;
  onEditItem: (item: any, section: string) => void;
  onDeleteItem: (item: any, section: string) => void;
  onCreateItem: () => void;
  onViewAll: () => void;
  onAssignPermissions?: (role: any) => void;
}

export default function DataList({
  section,
  sectionTitle,
  onEditItem,
  onDeleteItem,
  onCreateItem,
  onViewAll,
  onAssignPermissions
}: DataListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 4;

  // Fetch data based on section
  const { data, isLoading, error } = useQuery({
    queryKey: [section],
    queryFn: apiMapping[section] || (() => Promise.resolve({ data: { items: [] } })),
  });

  // Extract items from API response - handle different response structures
  const getItemsFromResponse = (response: any) => {
    if (!response?.data) return [];

    // Handle different response structures
    if (response.data.users) return response.data.users; // Users API
    if (Array.isArray(response.data)) return response.data; // Direct array response

    return [];
  };

  const allItems = getItemsFromResponse(data);

  // Filter items based on search term
  const filteredItems = allItems.filter((item: any) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.title && item.title.toLowerCase().includes(searchLower)) ||
      (item.email && item.email.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      (item.key && item.key.toLowerCase().includes(searchLower)) ||
      (section === 'projects' && item.customer?.name && item.customer.name.toLowerCase().includes(searchLower))
    );
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading {sectionTitle}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading {sectionTitle}. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Add New button */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${sectionTitle.toLowerCase()}...`}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full h-8 px-3 pr-10 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {/* <Button
          onClick={onCreateItem}
          className="bg-[#2b6cb0] hover:bg-[#2b6cb0]/90 h-8 w-8 p-0 rounded-full group transition-all duration-500 ease-out hover:w-auto hover:px-3 overflow-hidden"
        >
          <span className="group-hover:hidden text-white font-bold transition-opacity duration-300 delay-150 ease-in-out">+</span>
          <span className="hidden group-hover:inline text-white font-medium text-sm whitespace-nowrap transition-opacity duration-300 delay-150 ease-in-out">
            New {sectionTitle === 'Users' ? 'User' :
                    sectionTitle}
          </span>
        </Button> */}
      </div>

      {/* Data List */}
      {currentItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-sm">
            {searchTerm
              ? `No ${sectionTitle.toLowerCase()} found matching "${searchTerm}"`
              : `No ${sectionTitle.toLowerCase()} found`
            }
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {currentItems.map((item: any, index: number) => (
            <Card
              key={item.id || index}
              className="group hover:bg-accent/50 transition-colors duration-200 border border-border rounded-lg !py-0"
            >
              <CardContent className="p-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left side - Name, Details */}
                  <div className="flex items-start flex-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {item.name || item.title || 'Unnamed'}
                          </div>
                          {(item.email || item.description || (section === 'projects' && item.customer?.name)) && (
                            <div className="text-xs text-muted-foreground truncate">
                              {section === 'projects' && item.customer?.name
                                ? `Customer: ${item.customer.name}`
                                : item.email || item.description
                              }
                            </div>
                          )}
                        </div>


                        {/* Section-specific badges */}
                        {section === 'users' && item.userRoles && item.userRoles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.userRoles.slice(0, 2).map((role: any, roleIndex: number) => (
                              <Badge key={roleIndex} variant="secondary" className="bg-[#0d9488] text-white text-xs">
                                {role.role?.name || role.name || 'Unknown Role'}
                              </Badge>
                            ))}
                            {item.userRoles.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.userRoles.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* {section === 'permissions' && item.resource && (
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              Resource: {item.resource.name}
                            </Badge>
                          </div>
                        )}

                        {section === 'roles' && item.rolePerms && (
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {item.rolePerms.length} permission{item.rolePerms.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Action Buttons */}
                  <div className="flex items-center justify-end gap-2">
                    {onAssignPermissions && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs bg-[#0d9488] text-white hover:bg-[#0d9488]/90 hover:text-white border-[#0d9488]"
                        onClick={() => onAssignPermissions(item)}
                      >
                        <Key className="h-3 w-3 " />
                        Assign
                      </Button>
                    )}

                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, allItems.length)} of {allItems.length} items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
