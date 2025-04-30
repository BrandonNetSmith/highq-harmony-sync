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
  
  // Process options to remove duplicates, blanks and organize fields
  const processedOptions = React.useMemo(() => {
    if (!options || options.length === 0) return [];
    
    // Create a map to track field variations by their lowercase normalized form
    const fieldMap = new Map();
    
    options.forEach(field => {
      // Skip empty fields, undefined, null, or whitespace-only fields
      if (!field || typeof field !== 'string' || field.trim() === '') return;
      
      // Normalize the field name for comparison (lowercase, no special chars)
      const normalizedKey = field.toLowerCase().replace(/[_\s.-]/g, '');
      
      // Skip if the normalized key is empty after removing special chars
      if (!normalizedKey) return;
      
      if (!fieldMap.has(normalizedKey)) {
        // First occurrence of this field
        fieldMap.set(normalizedKey, {
          variations: [field],
          // Prefer camelCase or simple field names for display
          preferred: field
        });
      } else {
        // Add this variation to existing field
        const current = fieldMap.get(normalizedKey);
        current.variations.push(field);
        
        // Update preferred variation based on preference order:
        // 1. camelCase (e.g., firstName)
        // 2. Simple field name (e.g., firstname)
        // 3. PascalCase (e.g., FirstName)
        // 4. snake_case (e.g., first_name)
        
        // Check if current field is camelCase (first char lowercase, contains uppercase)
        if (
          field.charAt(0).toLowerCase() === field.charAt(0) && 
          /[A-Z]/.test(field) &&
          !field.includes('.')
        ) {
          current.preferred = field;
        } 
        // Check for dotted path but with camelCase last part (custom.fieldName)
        else if (
          field.includes('.') && 
          field.split('.').pop().charAt(0).toLowerCase() === field.split('.').pop().charAt(0) && 
          /[A-Z]/.test(field.split('.').pop())
        ) {
          current.preferred = field;
        }
        // Keep simple field names if we don't already have a camelCase
        else if (
          !/[._-]/.test(field) && 
          !/[A-Z]/.test(field) &&
          (/_/.test(current.preferred) || 
           current.preferred.charAt(0).toUpperCase() === current.preferred.charAt(0) ||
           current.preferred.includes('.'))
        ) {
          current.preferred = field;
        }
      }
    });
    
    // Create sorted array of preferred field names
    const preferredFields = Array.from(fieldMap.values())
      .map(item => item.preferred)
      .filter(field => field && field.trim() !== '') // Filter out any empty fields that might have slipped through
      .sort((a, b) => {
        // Sort common fields like name, email at the top
        const commonFields = ['name', 'email', 'phone', 'firstName', 'lastName', 'address', 'dateOfBirth', 'dob', 'clientName'];
        
        // Check if fields are in common fields list
        const aCommonIndex = commonFields.findIndex(f => 
          a.toLowerCase().includes(f.toLowerCase()) || 
          (a.includes('.') && a.split('.').pop().toLowerCase().includes(f.toLowerCase()))
        );
        const bCommonIndex = commonFields.findIndex(f => 
          b.toLowerCase().includes(f.toLowerCase()) ||
          (b.includes('.') && b.split('.').pop().toLowerCase().includes(f.toLowerCase()))
        );
        
        // Both are common fields, sort by position in common fields list
        if (aCommonIndex !== -1 && bCommonIndex !== -1) {
          return aCommonIndex - bCommonIndex;
        }
        
        // Only a is common, a comes first
        if (aCommonIndex !== -1) return -1;
        
        // Only b is common, b comes first
        if (bCommonIndex !== -1) return 1;
        
        // Group fields with dots together
        const aHasDot = a.includes('.');
        const bHasDot = b.includes('.');
        
        if (aHasDot && !bHasDot) return 1;  // Move dotted paths later
        if (!aHasDot && bHasDot) return -1; // Keep simple fields first
        
        // For fields with dots, group by prefix
        if (aHasDot && bHasDot) {
          const aPrefix = a.split('.')[0];
          const bPrefix = b.split('.')[0];
          if (aPrefix !== bPrefix) {
            return aPrefix.localeCompare(bPrefix);
          }
        }
        
        // Neither is common or both have same dot structure, sort alphabetically
        return a.localeCompare(b);
      });
    
    return preferredFields;
  }, [options]);
  
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
      matchedField = processedOptions.find(field => 
        field.toLowerCase() === fieldName.toLowerCase()
      );
      
      // Strategy 2: Field contains our field name or vice versa
      if (!matchedField) {
        matchedField = processedOptions.find(field => {
          const normalizedOption = field.toLowerCase().replace(/[_\s]/g, '');
          return normalizedOption.includes(normalizedFieldName) || 
                 normalizedFieldName.includes(normalizedOption);
        });
      }
      
      // Strategy 3: Try matching parts of compound names (firstName -> first_name or first name)
      if (!matchedField && fieldName.length > 3) {
        // Camel case to separate words: firstName -> first name
        const parts = fieldName.replace(/([A-Z])/g, ' $1').trim().toLowerCase().split(' ');
        if (parts.length > 1) {
          matchedField = processedOptions.find(field => {
            const normalizedOption = field.toLowerCase();
            return parts.every(part => normalizedOption.includes(part));
          });
        }
      }
      
      // Strategy 4: Check for custom fields that might match
      if (!matchedField && fieldName.startsWith('custom')) {
        const customFieldName = fieldName.replace(/^custom[._]?/i, '');
        if (customFieldName.length > 2) {
          matchedField = processedOptions.find(field =>
            (field.toLowerCase().includes('custom') && 
            field.toLowerCase().includes(customFieldName.toLowerCase()))
          );
        }
      }
      
      // If we found a match using any strategy, apply it
      if (matchedField) {
        console.log(`Auto-matching ${fieldName} to IntakeQ field: ${matchedField}`);
        onChange(matchedField);
      }
    }
  }, [processedOptions, isDiscovered, hasOptions, fieldName, value, onChange]);

  // Log field information with processed options
  console.log(`IntakeQFieldSelect[${dataType}/${fieldName}]:`, { 
    isDiscovered, 
    hasOptions, 
    optionsCount: processedOptions?.length || 0,
    value: displayValue,
    availableOptionsPreview: processedOptions?.slice(0, 10),
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
            processedOptions.map((field: string) => (
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
