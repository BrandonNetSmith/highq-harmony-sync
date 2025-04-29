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
  // Only display options if fields have been discovered and we have options
  const hasOptions = isDiscovered && options && options.length > 0;
  
  // If discovery has happened and we have options, show them
  // Otherwise show an appropriate placeholder
  const displayValue = value || "";
  const placeholder = !isDiscovered 
    ? "Click 'Discover IntakeQ Fields'" 
    : (hasOptions ? "Select IntakeQ field" : "No fields found");

  // For debugging
  console.log(`IntakeQFieldSelect[${dataType}/${fieldName}]:`, { 
    isDiscovered, 
    hasOptions, 
    optionsCount: options?.length || 0,
    value: displayValue,
    options
  });

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
            options.map((field: string) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="no-fields-placeholder" value="no-fields-placeholder" disabled>
              {isDiscovered ? "No fields found" : "Click 'Discover IntakeQ Fields' first"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
