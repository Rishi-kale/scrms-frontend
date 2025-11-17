"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CustomersFormProps {
  isCreating: boolean;
  isEditing: boolean;
  selectedCustomer?: any;
  onSave: (data: any) => void;
  isLoading?: boolean;
  includeContactInfo?: boolean;
}

export default function CustomersForm({
  isCreating,
  isEditing,
  selectedCustomer,
  onSave,
  isLoading = false,
  includeContactInfo = false
}: CustomersFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    isActive: true
  });

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && selectedCustomer) {
      setFormData({
        name: selectedCustomer.name || '',
        email: selectedCustomer.email || '',
        phone: selectedCustomer.phone || '',
        company: selectedCustomer.company || '',
        isActive: selectedCustomer.isActive ?? true
      });
    } else {
      // Reset form for creating
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        isActive: true
      });
    }
  }, [isEditing, selectedCustomer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer-name" className="text-sm font-medium">
          Customer Name *
        </Label>
        <Input
          id="customer-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter customer name"
          required
        />
      </div>

      {includeContactInfo && (
        <>
          <div className="space-y-2">
            <Label htmlFor="customer-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="customer-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="customer-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 555-555-5555"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-company" className="text-sm font-medium">
              Company Name
            </Label>
            <Input
              id="customer-company"
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Company Inc."
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
        <div className="space-y-0.5">
          <Label htmlFor="customer-active" className="text-sm font-medium cursor-pointer">
            Customer Status
          </Label>
          <p className="text-xs text-gray-500">
            {formData.isActive ? 'Active customer' : 'Inactive customer'}
          </p>
        </div>
        <Switch
          id="customer-active"
          checked={formData.isActive}
          onCheckedChange={(checked) => handleInputChange('isActive', checked)}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading || !formData.name.trim()}
          className="bg-[#0d9488] hover:bg-[#0f766e] text-white"
        >
          {isLoading ? 'Saving...' : (isEditing ? 'Update Customer' : 'Create Customer')}
        </Button>
      </div>
    </div>
  );
}