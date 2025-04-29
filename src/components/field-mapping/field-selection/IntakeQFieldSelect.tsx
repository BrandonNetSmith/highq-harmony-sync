
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
      // For better field matching, normalize both for comparison
      const normalizedFieldName = fieldName.toLowerCase().replace(/[_\s]/g, '');
      
      // Try different matching strategies in order of preference
      let matchedField = null;
      
      // Strategy 1: Exact match (case-insensitive)
      matchedField = options.find(field => 
        field.toLowerCase() === fieldName.toLowerCase()
      );
      
      // Strategy 2: Field contains our field name or vice versa
      if (!matchedField) {
        matchedField = options.find(field => {
          const normalizedOption = field.toLowerCase().replace(/[_\s]/g, '');
          return normalizedOption.includes(normalizedFieldName) || 
                 normalizedFieldName.includes(normalizedOption);
        });
      }
      
      // Strategy 3: Try matching parts of compound names (firstName -> first_name or first name)
      if (!matchedField) {
        // Camel case to separate words: firstName -> first name
        const parts = fieldName.replace(/([A-Z])/g, ' $1').trim().toLowerCase().split(' ');
        if (parts.length > 1) {
          matchedField = options.find(field => {
            const normalizedOption = field.toLowerCase();
            return parts.every(part => normalizedOption.includes(part));
          });
        }
      }
      
      // If we found a match using any strategy, apply it
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
