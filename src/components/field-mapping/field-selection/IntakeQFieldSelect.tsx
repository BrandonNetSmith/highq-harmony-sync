
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

  return (
    <div className="text-right">
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select IntakeQ field" />
        </SelectTrigger>
        <SelectContent>
          {validOptions.map((field: string) => (
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
