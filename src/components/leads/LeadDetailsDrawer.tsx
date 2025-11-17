import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import { X, ExternalLink, Building2, CalendarDays, FileText, User, Link2, Hash, Mail, Phone, MapPin } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { STATUS_STYLES } from "@/app/(app)/constant";
import { LeadSummary, leadsAPI } from "@/lib/api-services";

interface LeadDetailsDrawerProps {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
}

export function LeadDetailsDrawer({ leadId, open, onClose }: LeadDetailsDrawerProps) {
  const { data: lead, isLoading } = useQuery({
    queryKey: ["leads", leadId],
    queryFn: () => leadId ? leadsAPI.getById(leadId) : null,
    enabled: !!leadId && open,
  });

  const leadData = lead?.data as LeadSummary;

  const getLeadInitial = () => {
    return leadData?.title?.charAt(0).toUpperCase() || 'L';
  };

  const DetailItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | undefined }) => (
    <div className="flex items-start gap-3">
      <div className="bg-teal-100 p-2 rounded-md">
        <Icon className="h-5 w-5 text-[#0d9488]" />
      </div>
      <div>
        <p className="text-xs text-teal-800 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800">{value || "Not provided"}</p>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[65vw] md:w-[55vw] lg:w-[50vw] xl:w-[53vw] !max-w-[700px] !sm:max-w-[65vw] !md:max-w-[55vw] !lg:max-w-[50vw] !xl:max-w-[53vw] overflow-y-auto">
        <SheetTitle className="sr-only">Lead Details</SheetTitle>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin mx-auto mb-2 border-4 border-[#0d9488] border-t-transparent rounded-full" />
              <p className="text-muted-foreground">Loading lead details...</p>
            </div>
          </div>
        ) : !leadData ? (
          <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h4 className="font-medium text-gray-900 mb-2">Lead not found</h4>
            <p className="text-sm text-muted-foreground">Unable to load lead details</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-[#0d9488] text-white text-lg">
                    {getLeadInitial()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">
                    {leadData.title}
                  </h2>
                  <p className="text-muted-foreground">Lead</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`px-3 py-1 text-xs font-medium ${STATUS_STYLES[leadData.status || "New"]}`}
              >
                {leadData.status || "New"}
              </Badge>
            </div>

            {/* Customer Information */}
            {leadData.customer && (
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-5 shadow-sm mb-6">
                <h3 className="text-lg font-semibold text-teal-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#0d9488]" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem icon={Building2} label="Company" value={leadData.customer.name} />
                  {leadData.customer.email && (
                    <DetailItem icon={Mail} label="Email" value={leadData.customer.email} />
                  )}
                  {leadData.customer.phone && (
                    <DetailItem icon={Phone} label="Phone" value={leadData.customer.phone} />
                  )}
                  {leadData.customer.company && (
                    <DetailItem icon={Building2} label="Industry" value={leadData.customer.company} />
                  )}
                </div>
              </div>
            )}

            {/* Lead Description */}
            {leadData.description && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5 shadow-sm mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Description
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {leadData.description}
                </p>
              </div>
            )}

            {/* Lead Details */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-xl p-5 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-teal-900 mb-4">Lead Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem icon={User} label="Created By" value={leadData.createdBy} />
                <DetailItem 
                  icon={CalendarDays} 
                  label="Created Date" 
                  value={leadData.createdAt ? format(new Date(leadData.createdAt), "PPP") : undefined} 
                />
                <DetailItem icon={Link2} label="Source" value={leadData.source} />
                <DetailItem icon={Hash} label="Lead ID" value={leadData._id} />
              </div>
            </div>

            {/* Project Link for Won Leads */}
            {leadData.status === "Won" && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5 shadow-sm mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-1">Lead Converted</h3>
                    <p className="text-sm text-green-700">This lead has been converted to a project</p>
                  </div>
                  <Button asChild className="bg-[#0d9488] hover:bg-teal-600">
                    <Link
                      href={`/projects?id=${leadData._id}`}
                      target="_blank"
                      className="flex items-center gap-2"
                    >
                      <span>View Project</span>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button className="bg-[#0d9488] hover:bg-teal-600" disabled>
                Edit Lead
              </Button>
              <Button variant="outline" className="border-[#0d9488] text-[#0d9488] hover:bg-teal-50" disabled>
                Convert to Project
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}