
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
}

export const IntakeQFieldSelect = ({
  value,
  options,
  onChange,
  disabled,
  dataType,
  fieldName
}: IntakeQFieldSelectProps) => {
  // Make sure we always have valid options
  const validOptions = options.filter(Boolean);
  
  // Check if fields have been discovered
  const hasDiscoveredFields = validOptions.length > 1 || (validOptions.length === 1 && validOptions[0] !== value);

  return (
    <div className="text-right">
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={hasDiscoveredFields ? "Select IntakeQ field" : "Discover IntakeQ Fields first"} />
        </SelectTrigger>
        <SelectContent>
          {/* Only show the current value if we haven't discovered fields yet */}
          {!hasDiscoveredFields && (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          )}
          
          {/* Show discovered fields if available */}
          {hasDiscoveredFields && validOptions.map((field: string) => (
            <SelectItem key={field} value={field}>
              {field}
            </SelectItem>
          ))}
          
          {validOptions.length === 0 && (
            <SelectItem value={value || fieldName || ""} disabled>
              Click "Discover IntakeQ Fields" first
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
