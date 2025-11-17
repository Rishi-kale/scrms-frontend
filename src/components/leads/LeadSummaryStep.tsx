"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { LeadStatus } from "@/lib/api-services";
import { LeadFormData } from "./LeadFormStep";

interface LeadSummaryStepProps {
  data: LeadFormData;
  onPrevious: () => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  generatedSummary?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

const STATUS_BADGE: Record<LeadStatus, string> = {
  "New": "bg-blue-100 text-blue-800",
  "Contacted": "bg-amber-100 text-amber-800",
  "Follow-up": "bg-indigo-100 text-indigo-800",
  "Proposal Sent": "bg-cyan-100 text-cyan-800",
  "In Negotiation": "bg-purple-100 text-purple-800",
  "Won": "bg-green-100 text-green-800",
  "Lost": "bg-red-100 text-red-800",
  "On-hold": "bg-gray-200 text-gray-800",
};

export default function LeadSummaryStep({ data, onPrevious, onGenerate, isGenerating, generatedSummary, onSubmit, isSubmitting }: LeadSummaryStepProps) {
  const info = useMemo(() => ([
    { label: 'Customer Name', value: data.customerName },
    // { label: 'Customer Email', value: data.customerEmail || '-' },
    // { label: 'Customer Phone', value: data.customerPhone || '-' },
    // { label: 'Customer Company', value: data.customerCompany || '-' },
    { label: 'Title', value: data.title },
    { label: 'Source', value: data.source || '-' },
  ]), [data]);

  return (
    <div className="space-y-3 w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {info.map((item) => (
              <div key={item.label}>
                <Label className="text-sm font-medium text-muted-foreground">{item.label}</Label>
                <p className="text-sm font-medium mt-1">{item.value}</p>
              </div>
            ))}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              {data.status ? (
                <div className="mt-1">
                  <Badge className={`${STATUS_BADGE[data.status as LeadStatus]} border-0`}>{data.status}</Badge>
                </div>
              ) : (
                <p className="text-sm font-medium mt-1">-</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
            <p className="text-sm whitespace-pre-wrap">{data.description || '-'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating summary...
            </div>
          ) : (
            <div className="p-4 bg-muted/30 rounded-lg border min-h-[120px] text-sm">
              {generatedSummary?.trim() ? generatedSummary : 'Click "Generate Summary" to create a concise lead summary.'}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onPrevious}>Previous Step</Button>
        <div className="flex items-center gap-2">
          <Button onClick={onGenerate} disabled={isGenerating} className="px-6">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
          {onSubmit && (
            <Button onClick={onSubmit} disabled={isSubmitting} className="px-6">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create Lead</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


