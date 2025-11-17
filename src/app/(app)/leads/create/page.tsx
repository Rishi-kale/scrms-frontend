"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ArrowLeft, Zap, Loader2 } from "lucide-react";
import LeadFormStep, { LeadFormData } from "@/components/leads/LeadFormStep";
import LeadSummaryStep from "@/components/leads/LeadSummaryStep";
import { leadsAPI } from "@/lib/api-services";
import { useMutation } from "@tanstack/react-query";
import { useNotify } from "@/components/ui/NotificationProvider";
import { useUser } from "@/lib/user-context";

const steps = [
  { id: 1, label: "Lead Details" },
  { id: 2, label: "Summary" },
];

export default function CreateLeadPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [leadData, setLeadData] = useState<LeadFormData>({
    customerId: "",
    customerName: "",
    title: "",
    description: "",
    source: "",
    status: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { notify } = useNotify();


  const createMutation = useMutation({
    mutationFn: async () => {
      try {
        const payload = {
          customerId: leadData.customerId,
          customerName: leadData.customerName,
          title: leadData.title,
          description: leadData.description,
          source: leadData.source,
          status: leadData.status || undefined,
          createdBy: user?.name || null
        };
        const res = await leadsAPI.create(payload as any);
        return res;
      } catch (error) {
        console.error('Error creating lead:', error);
        throw error;
      }
    },
    onSuccess: (res) => {
      const id = (res as any)?.data?.id || (res as any)?.data?._id || (res as any)?.data?.data?.id || (res as any)?.data?.data?._id;
      notify("Lead created successfully", "success", () => {
        router.push(`/leads`);
      });
    },
    onError: (error: any) => {
      console.error('Lead creation failed:', error);

      // Handle validation errors with field-specific messages
      if (error?.response?.status === 400 && error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        let errorMessage = "Validation failed:\n";
        const errors: Record<string, string> = {};

        validationErrors.forEach((err: any, index: number) => {
          const fieldName = err.path || err.field || 'field';
          const message = err.msg || err.message || 'Invalid value';
          errorMessage += `• ${fieldName}: ${message}`;
          if (index < validationErrors.length - 1) {
            errorMessage += '\n';
          }

          // Store field-specific errors
          errors[fieldName] = message;
        });

        // Set field errors for form highlighting
        setFieldErrors(errors);

        notify(errorMessage, "error");
        return;
      }

      // Extract meaningful error message for other errors
      let errorMessage = "Failed to create lead. Please try again.";


      notify(errorMessage, "error");
    },
  });

  const updateLeadData = (data: Partial<LeadFormData>) => {
    setLeadData(prev => ({ ...prev, ...data }));
    // Clear field errors when user updates data
    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors({});
    }
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      // Simple on-device generation for now; integrate backend later if needed
      const lines = [
        leadData.title && `Title: ${leadData.title}`,
        leadData.customerName && `Customer: ${leadData.customerName}`,
        leadData.source && `Source: ${leadData.source}`,
        leadData.status && `Status: ${leadData.status}`,
        leadData.description && `\nSummary:\n${leadData.description}`,
      ].filter(Boolean) as string[];
      setTimeout(() => {
        setGeneratedSummary(lines.join("\n"));
        setIsGenerating(false);
      }, 700);
    } catch (e) {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <LeadFormStep
            data={leadData}
            onUpdate={updateLeadData}
            onNext={() => setCurrentStep(2)}
            fieldErrors={fieldErrors}
          />
        );
      case 2:
        return (
          <LeadSummaryStep
            data={leadData}
            onPrevious={() => setCurrentStep(1)}
            onGenerate={handleGenerateSummary}
            isGenerating={isGenerating}
            generatedSummary={generatedSummary}
            onSubmit={() => createMutation.mutate()}
            isSubmitting={createMutation.isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background fixed inset-0 overflow-hidden">
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/leads')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Leads</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <span>Create Lead</span>
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Provide lead details and generate a concise summary
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-8">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <span className="text-xs sm:text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-2 sm:w-4 md:w-8 h-px bg-border mx-1 sm:mx-2 md:mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 h-[calc(100vh-180px)] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-h-full">
          <Card className="flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="flex-shrink-0 pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Lead Details</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Fill out the lead information
              </p>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
              {renderStepContent()}
            </CardContent>
          </Card>

          <Card className="flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="flex-shrink-0 pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Summary Preview</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Generated concise lead summary
              </p>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
              <div className="p-4 bg-muted/30 rounded-lg border min-h-[120px] text-sm">
                {isGenerating ? (
                  <div className="text-center text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating summary...
                  </div>
                ) : (
                  (generatedSummary || 'No summary yet. Use Generate Summary step.')
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
