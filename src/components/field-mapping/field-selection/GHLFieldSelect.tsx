
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
  
  // Make sure the current value is always in the options list
  if (value && !validOptions.includes(value)) {
    validOptions.push(value);
  }

  return (
    <div className="text-left">
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select GHL field" />
        </SelectTrigger>
        <SelectContent>
          {validOptions.map((field: string) => (
            <SelectItem key={field} value={field}>
              {field}
            </SelectItem>
          ))}
          {validOptions.length === 0 && (
            <SelectItem value={value || fieldName || ""} disabled>
              No fields available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
