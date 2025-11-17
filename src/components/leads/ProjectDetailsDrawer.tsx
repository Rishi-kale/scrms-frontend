import { format } from "date-fns";
import { X, ExternalLink, Building2, CalendarDays, FileText, User, Users, Activity, Mail, Phone, Hash, MapPin, Circle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { leadsAPI, LeadSummary } from "@/lib/api-services";
import { PROJECT_HEALTH } from "@/app/(app)/constant";


interface ProjectDetailsDrawerProps {
  projectId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ProjectDetailsDrawer({ projectId, open, onClose }: ProjectDetailsDrawerProps) {
  const { data: project, isLoading } = useQuery({
    queryKey: ["leads", projectId],
    queryFn: () => projectId ? leadsAPI.getById(projectId) : null,
    enabled: !!projectId && open,
  });

  const projectData = project?.data as LeadSummary;

  const getProjectInitial = () => {
    return projectData?.title?.charAt(0).toUpperCase() || 'P';
  };

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

  // Reusable DetailItem component to reduce code duplication
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
        <SheetTitle className="sr-only">Project Details</SheetTitle>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin mx-auto mb-2 border-4 border-[#0d9488] border-t-transparent rounded-full" />
              <p className="text-muted-foreground">Loading project details...</p>
            </div>
          </div>
        ) : !projectData ? (
          <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h4 className="font-medium text-gray-900 mb-2">Project not found</h4>
            <p className="text-sm text-muted-foreground">Unable to load project details</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-[#0d9488] text-white text-lg">
                    {getProjectInitial()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">
                    {projectData.title}
                  </h2>
                  <p className="text-muted-foreground">Project</p>
                </div>
              </div>
              {getStatusBadge(projectData.projectHealth || "Good")}
            </div>

            {/* Customer Information */}
            {projectData.customer && (
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-5 shadow-sm mb-6">
                <h3 className="text-lg font-semibold text-teal-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#0d9488]" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem icon={Building2} label="Company" value={projectData.customer.name} />
                  {projectData.customer.email && (
                    <DetailItem icon={Mail} label="Email" value={projectData.customer.email} />
                  )}
                  {projectData.customer.phone && (
                    <DetailItem icon={Phone} label="Phone" value={projectData.customer.phone} />
                  )}
                  {projectData.customer.company && (
                    <DetailItem icon={Building2} label="Industry" value={projectData.customer.company} />
                  )}
                </div>
              </div>
            )}

            {/* Project Description */}
            {projectData.description && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5 shadow-sm mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Description
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {projectData.description}
                </p>
              </div>
            )}

            {/* Project Details */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-xl p-5 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-teal-900 mb-4">Project Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem icon={User} label="Project Manager" value={projectData.projectManager} />
                <DetailItem icon={Users} label="Team Size" value={projectData.teamSize ? `${projectData.teamSize} members` : undefined} />
                <DetailItem icon={User} label="Created By" value={projectData.createdBy} />
                <DetailItem
                  icon={CalendarDays}
                  label="Created Date"
                  value={projectData.createdAt ? format(new Date(projectData.createdAt), "PPP") : undefined}
                />
                <DetailItem icon={Hash} label="Project ID" value={projectData._id} />
                <DetailItem icon={Activity} label="Health Status" value={projectData.projectHealth} />
              </div>
            </div>

            {/* Go to Floor Action */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 mb-1">Project Floor</h3>
                  <p className="text-sm text-indigo-700">View detailed project management dashboard</p>
                </div>
                <Button
                  className="bg-[#0d9488] hover:bg-teal-600"
                  onClick={async () => {
                    try {
                      await leadsAPI.syncLeadToJobs(projectData._id);
                      window.open('/floor', '_blank');
                    } catch (error) {
                      console.error("Failed to sync project to jobs service:", error);
                    }
                  }}
                >
                  <span>Go to Floor</span>
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button className="bg-[#0d9488] hover:bg-teal-600" disabled>
                Edit Project
              </Button>
              <Button variant="outline" className="border-[#0d9488] text-[#0d9488] hover:bg-teal-50" disabled>
                Manage Team
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}