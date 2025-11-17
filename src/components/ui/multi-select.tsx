"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// Removed Command imports since we're using a simpler approach

export interface MultiSelectOption {
  label: string;
  value: string;
  key?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  loading?: boolean;
  error?: boolean;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  loading = false,
  error = false,
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  

  // Removed handleUnselect since we're not showing individual badges anymore

  const handleSelect = (currentValue: string) => {
    if (selected.includes(currentValue)) {
      onChange(selected.filter((item) => item !== currentValue));
    } else {
      onChange([...selected, currentValue]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-10 px-3 text-sm border-gray-200 focus:border-[#0d9488] focus:ring-[#0d9488] hover:bg-gray-50",
            error && "border-red-500",
            selected.length > 0 && "py-2", // Add padding when items are selected
            className
          )}
          disabled={disabled}
        >
          {loading ? (
            "Loading..."
          ) : selected.length > 0 ? (
            <span className="text-sm text-gray-700">
              {selected.length} {selected.length === 1 ? 'selected' : 'selected'}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="max-h-60 overflow-auto">
          {loading ? (
            <div className="py-3 px-3">
              <span className="text-sm text-gray-500">Loading options...</span>
            </div>
          ) : error ? (
            <div className="py-3 px-3">
              <span className="text-sm text-red-500">Error loading options</span>
            </div>
          ) : options && options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "py-3 px-3 cursor-pointer hover:bg-gray-50 flex items-center transition-colors",
                  selected.includes(option.value) && "bg-green-50"
                )}
              >
                <Check
                  className={cn(
                    "mr-3 h-4 w-4 transition-opacity",
                    selected.includes(option.value) ? "opacity-100 text-green-600" : "opacity-0"
                  )}
                />
                <span className={cn(
                  "text-sm font-medium",
                  selected.includes(option.value) && "text-green-700 font-semibold"
                )}>
                  {option.label}
                </span>
              </div>
            ))
          ) : (
            <div className="py-3 px-3">
              <span className="text-sm text-gray-500">No options available</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
