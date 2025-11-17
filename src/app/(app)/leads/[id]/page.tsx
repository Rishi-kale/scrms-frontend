"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useUser } from "@/lib/user-context";
import Link from "next/link";
import { leadsAPI, LeadDetails, LeadStatus } from "@/lib/api-services";

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  if (!id) return notFound();

  const { data: leadData, isLoading, error } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => leadsAPI.getById(id),
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading lead details...</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !leadData?.data) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <Card className="p-4 md:p-6">
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">Failed to load lead details</div>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const lead = leadData.data;
  const linkedProject = lead.status === "Won" ? { id: lead._id, name: lead.title } : null;

  const isAdmin = user?.userRoles?.some(r => (r.role?.key || "").toLowerCase() === "admin");
  const isCreator = lead && user ? lead.createdBy === user.name : false;
  const canEdit = Boolean(isAdmin || isCreator);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg md:text-xl font-semibold">Lead Details</h1>
        {canEdit && (
          <Button variant="default" onClick={() => router.push(`/leads/${id}/edit`)}>
            Edit
          </Button>
        )}
      </div>

      <Card className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Customer</div>
              <div className="text-lg font-medium">{lead.customer?.name || '-'}</div>
            </div>
            <Badge
              className={`border-0 ${lead.status === "Won"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : lead.status === "Lost"
                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
            >
              {lead.status}
            </Badge>
          </div>

          {/* Title */}
          <div>
            <div className="text-xs text-muted-foreground">Title</div>
            <div className="text-lg font-medium">{lead.title}</div>
          </div>

          {/* Description */}
          {lead.description && (
            <div>
              <div className="text-xs text-muted-foreground">Description</div>
              <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                {lead.description}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Created By</div>
              <div className="text-sm font-medium">{lead.createdBy || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Source</div>
              <div className="text-sm font-medium">{lead.source || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Created Date</div>
              <div className="text-sm font-medium">{lead.createdAt ? formatDate(lead.createdAt) : '-'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Lead ID</div>
              <div className="text-sm font-medium font-mono">{lead._id}</div>
            </div>
          </div>

          {/* Linked Project Information */}
          {lead.status === "Won" && linkedProject && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-green-800">Linked Project</div>
                  <div className="text-sm text-green-700">{linkedProject.name}</div>
                </div>
                <Button asChild size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                  <Link href={`/projects`}>View in Projects</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => router.back()}>
              Back to Leads
            </Button>
            {canEdit && (
              <Button onClick={() => router.push(`/leads/${id}/edit`)}>
                Edit Lead
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}


