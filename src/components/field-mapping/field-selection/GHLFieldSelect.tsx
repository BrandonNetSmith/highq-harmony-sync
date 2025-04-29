
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
  isDiscovered?: boolean;
}

export const GHLFieldSelect = ({
  value,
  options,
  onChange,
  disabled,
  dataType,
  fieldName,
  isDiscovered = false
}: GHLFieldSelectProps) => {
  // Only display options if fields have been discovered
  const hasOptions = isDiscovered && options && options.length > 0;
  
  // If discovery has happened and we have options, show them
  // Otherwise show an appropriate placeholder
  const displayValue = hasOptions && value ? value : "";
  const placeholder = isDiscovered 
    ? (hasOptions ? "Select GHL field" : "No fields found") 
    : "Click 'Discover GHL Fields'";

  return (
    <div className="text-left">
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
            options.map((field: string) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="no-fields-placeholder" value="no-fields-placeholder" disabled>
              {isDiscovered ? "No fields found" : "Click 'Discover GHL Fields' first"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
