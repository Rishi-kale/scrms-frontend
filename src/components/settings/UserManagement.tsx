"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  Key,
  FileText,
  UserPlus,
  Loader2
} from "lucide-react";
import DataList from "./DataList";
import { adminAPI } from "@/lib/api-services";

// User Management sections
const userManagementSections = [
  {
    id: 'users',
    title: 'Users',
    description: 'Manage user with project access',
    icon: Users,
    color: 'bg-blue-500',
  },

];

interface UserManagementProps {
  onOpenDrawer: (section: string) => void;
  onEditItem: (item: any, section: string) => void;
  onDeleteItem: (item: any, section: string) => void;
  onCreateItem: (section: string) => void;
  onAssignPermissions?: (role: any) => void;
}

export default function UserManagement({ onOpenDrawer, onEditItem, onDeleteItem, onCreateItem, onAssignPermissions }: UserManagementProps) {
  // Fetch data for all user management sections
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: adminAPI.getAllUsers,
  });

  // Calculate counts from API responses
  const getCount = (data: any, sectionId: string) => {
    if (!data?.data) return 0;

    switch (sectionId) {
      case 'users':
        return data.data.users?.length || 0;
      // case 'roles':
      //   return data.data.roles?.length || 0;
      // case 'permissions':
      //   return data.data.permissions?.length || 0;
      default:
        return 0;
    }
  };

  const isLoading = usersLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">manage user's project</p>
        </div>

      </div>

      <div
        className={`grid gap-6 ${userManagementSections.length === 1 ? "grid-cols-1 " : "grid-cols-1 md:grid-cols-2"
          }`}
      >
        {userManagementSections.map((section) => {
          const count = getCount(
            section.id === "users" ? usersData : 0,
            section.id
          );

          return (
            <Card key={section.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${section.color}`}>
                      <section.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-[#0d9488] text-white mr-6">
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      count
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <DataList
                  section={section.id}
                  sectionTitle={section.title}
                  onEditItem={onEditItem}
                  onDeleteItem={onDeleteItem}
                  onCreateItem={() => onCreateItem(section.id)}
                  onViewAll={() => { }}
                  onAssignPermissions={section.id === "users" ? onAssignPermissions : undefined}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
