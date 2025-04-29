
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IntakeQFieldSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  dataType?: string;
  fieldName?: string;
  isDiscovered?: boolean;
}

export const IntakeQFieldSelect = ({
  value,
  options,
  onChange,
  disabled,
  dataType,
  fieldName,
  isDiscovered = false
}: IntakeQFieldSelectProps) => {
  // Make sure we always have valid options
  const validOptions = options.filter(Boolean);
  
  // Only show options if fields have been discovered
  const hasOptions = isDiscovered && validOptions.length > 0;
  
  // If there are no discovered fields, show placeholder
  const displayValue = hasOptions ? value : "";
  const placeholder = hasOptions ? "Select IntakeQ field" : "Click 'Discover IntakeQ Fields'";

  return (
    <div className="text-right">
      <Select
        value={displayValue}
        onValueChange={onChange}
        disabled={disabled || !hasOptions}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {hasOptions ? (
            // Show discovered fields if available
            validOptions.map((field: string) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))
          ) : (
            // Show instruction if no fields are discovered
            <SelectItem value="" disabled>
              Click "Discover IntakeQ Fields" first
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
