
import React, { useEffect } from 'react';
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

  // Auto-apply matching fields when options change
  useEffect(() => {
    if (isDiscovered && hasOptions && !value && fieldName) {
      // Check if we have a direct field name match in the options
      const matchedField = options.find(field => 
        field.toLowerCase() === fieldName.toLowerCase() ||
        field.toLowerCase().includes(fieldName.toLowerCase())
      );
      
      if (matchedField) {
        console.log(`Auto-matching ${fieldName} to IntakeQ field: ${matchedField}`);
        onChange(matchedField);
      }
    }
  }, [options, isDiscovered, hasOptions, fieldName, value, onChange]);

  // More detailed logging to help debug field discovery issues
  console.log(`IntakeQFieldSelect[${dataType}/${fieldName}]:`, { 
    isDiscovered, 
    hasOptions, 
    optionsCount: options?.length || 0,
    value: displayValue,
    availableOptions: options,
    selectedField: value || 'none'
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
