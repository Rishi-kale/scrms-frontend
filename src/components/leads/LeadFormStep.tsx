"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LeadStatus } from "@/lib/api-services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import CustomersForm from "@/components/settings/CustomersForm";
import { metaAPI } from "@/lib/api-services";
import { useNotify } from "../ui/NotificationProvider";

export type LeadFormData = {
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  title: string;
  description: string;
  source: string;
  status: LeadStatus | "";
};

interface LeadFormStepProps {
  data: LeadFormData;
  onUpdate: (data: Partial<LeadFormData>) => void;
  onNext: () => void;
  isEditMode?: boolean;
  isSubmitting?: boolean;
  fieldErrors?: Record<string, string>;
}

const STATUS_OPTIONS: LeadStatus[] = [
  "New",
  "Contacted",
  "Follow-up",
  "Proposal Sent",
  "In Negotiation",
  "Won",
  "Lost",
  "On-hold",
];

const SOURCE_OPTIONS: string[] = [
  "Website",
  "Referral",
  "LinkedIn",
  "Email",
  "Cold Call",
  "Event",
  "Other",
];

export default function LeadFormStep({ data, onUpdate, onNext, isEditMode = false, isSubmitting = false, fieldErrors = {} }: LeadFormStepProps) {
  const [isValid, setIsValid] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const queryClient = useQueryClient();
  const { notify } = useNotify();

  // Fetch customers
  const { data: customersResponse, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: metaAPI.getCustomers,
  });

  const customers = customersResponse?.data || [];

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      return metaAPI.createCustomer({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        company: customerData.company,
        description: customerData.company ? `Email: ${customerData.email || ''}, Phone: ${customerData.phone || ''}, Company: ${customerData.company}` : undefined,
      });
    },
    onSuccess: (response: any) => {
      // Refresh customers list
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notify("Customer created successfully","success");
      const customer = response?.data || response;
      const customerId = customer?._id;
      const customerName = customer?.name;

      if (customerId && customerName) {
        onUpdate({
          customerId,
          customerName
        });
        setIsDrawerOpen(false);
      }
    },
  });

  useEffect(() => {
    const required = [
      data.customerId,
      data.title,
      data.status,
    ];
    setIsValid(required.every((v) => v && String(v).trim() !== ""));
  }, [data]);

  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers.find((c: any) => c._id === customerId);
    onUpdate({
      customerId,
      customerName: selectedCustomer?.name || ""
    });
  };

  const handleCustomerSave = (customerData: any) => {
    createCustomerMutation.mutate(customerData);
  };

  return (
    <div className="space-y-3 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Customer Name Dropdown */}
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-sm font-medium">Customer Name <span className="text-red-500">*</span></Label>
          <div className="flex gap-2">
            <Select value={data.customerId} onValueChange={handleCustomerSelect}>
              <SelectTrigger className={`flex-1 ${fieldErrors.customerId ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customersLoading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading customers...
                    </div>
                  </SelectItem>
                ) : customers.length === 0 ? (
                  <SelectItem value="no-customers" disabled>
                    No customers found
                  </SelectItem>
                ) : (
                  customers.map((customer: any) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="px-3">
                  <Plus className="h-4 w-4" />
                  <span>Create New Customer</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto z-100">
                <SheetHeader className="px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <SheetTitle className="text-xl font-semibold">
                        Create New Customer
                      </SheetTitle>
                      <SheetDescription className="mt-1">
                        Add a new customer to the system.
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
                  <CustomersForm
                    isCreating={true}
                    isEditing={false}
                    onSave={handleCustomerSave}
                    isLoading={createCustomerMutation.isPending}
                    includeContactInfo={true}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          {fieldErrors.customerId && (
            <p className="text-sm text-red-500 mt-1">{fieldErrors.customerId}</p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-sm font-medium">Title <span className="text-red-500">*</span></Label>
          <Input
            placeholder="Lead title"
            value={data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className={fieldErrors.title ? "border-red-500" : ""}
          />
          {fieldErrors.title && (
            <p className="text-sm text-red-500 mt-1">{fieldErrors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-sm font-medium">Description</Label>
          <Textarea
            rows={4}
            placeholder="Enter a brief description..."
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
          />
        </div>

        {/* Source */}
        <div className="space-y-1">
          <Label className="text-sm font-medium">Source</Label>
          <Select value={data.source} onValueChange={(v) => onUpdate({ source: v })}>
            <SelectTrigger className={fieldErrors.source ? "border-red-500" : ""}>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.source && (
            <p className="text-sm text-red-500 mt-1">{fieldErrors.source}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-1">
          <Label className="text-sm font-medium">Status <span className="text-red-500">*</span></Label>
          <Select value={data.status} onValueChange={(v) => onUpdate({ status: v as LeadStatus })}>
            <SelectTrigger className={fieldErrors.status ? "border-red-500" : ""}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.status && (
            <p className="text-sm text-red-500 mt-1">{fieldErrors.status}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={onNext}
          disabled={!isValid || isSubmitting}
          className="px-8"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isEditMode ? "Update Lead" : "Next"}
        </Button>
      </div>
    </div>
  );
}