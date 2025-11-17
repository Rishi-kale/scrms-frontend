"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2 } from "lucide-react";
import LeadFormStep, { LeadFormData } from "@/components/leads/LeadFormStep";
import { leadsAPI } from "@/lib/api-services";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [leadData, setLeadData] = useState<LeadFormData>({
    customerId: "",
    customerName: "",
    title: "",
    description: "",
    source: "",
    status: "",
  });

  // Fetch existing lead data
  const { data: leadResponse, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => leadsAPI.getById(id),
    enabled: !!id,
  });

  // Update form data when lead is fetched
  useEffect(() => {
    if (leadResponse?.data) {
      const lead = leadResponse.data;
      setLeadData({
        customerId: lead.customer?.id || "",
        customerName: lead.customer?.name || "",
        title: lead.title || "",
        description: lead.description || "",
        source: lead.source || "",
        status: lead.status || "",
      });
    }
  }, [leadResponse]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: leadData.title,
        description: leadData.description,
        source: leadData.source,
        status: leadData.status || undefined,
        updatedBy: "current-user", // This should be replaced with actual user
      };
      const res = await leadsAPI.update(id, payload);
      return res;
    },
    onSuccess: () => {
      router.push(`/leads/${id}`);
    },
  });

  const updateLeadData = (data: Partial<LeadFormData>) => {
    setLeadData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = () => {
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading lead...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background fixed inset-0 overflow-hidden">
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Edit Lead</h1>
              <p className="text-sm text-muted-foreground">Update lead information</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <LeadFormStep
                    data={leadData}
                    onUpdate={updateLeadData}
                    onNext={handleSubmit}
                    isEditMode={true}
                    isSubmitting={updateMutation.isPending}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
