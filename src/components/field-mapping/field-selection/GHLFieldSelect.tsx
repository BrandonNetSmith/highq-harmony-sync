
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GHLFieldSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  dataType?: string;
  fieldName?: string;
}

export const GHLFieldSelect = ({
  value,
  options,
  onChange,
  disabled,
  dataType,
  fieldName
}: GHLFieldSelectProps) => {
  // Make sure we always have valid options
  const validOptions = options.filter(Boolean);
  
  // Check if fields have been discovered
  const hasDiscoveredFields = validOptions.length > 0;
  
  // If there are no discovered fields, just show the field name or a placeholder
  const displayValue = hasDiscoveredFields ? value : (fieldName || "");
  const placeholder = hasDiscoveredFields ? "Select GHL field" : "Click 'Discover GHL Fields'";

  return (
    <div className="text-left">
      <Select
        value={displayValue}
        onValueChange={onChange}
        disabled={disabled || !hasDiscoveredFields}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {hasDiscoveredFields ? (
            // Show discovered fields if available
            validOptions.map((field: string) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))
          ) : (
            // Show instruction if no fields are discovered
            <SelectItem value="" disabled>
              Click "Discover GHL Fields" first
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
