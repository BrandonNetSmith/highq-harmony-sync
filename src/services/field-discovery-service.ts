
import { getGHLMockFields, getIntakeQMockFields } from '@/hooks/field-discovery/mock-field-data';
import { supabase } from "@/integrations/supabase/client";
import { getApiKeys } from "@/services/apiKeys";

/**
 * Service responsible for discovering fields from different systems
 */
export const fieldDiscoveryService = {
  /**
   * Discovers fields for the specified system and data type
   */
  discoverFields: async (system: 'ghl' | 'intakeq', dataType: string): Promise<string[]> => {
    console.log(`Discovering fields for ${system} ${dataType}`);
    
    // Use the corresponding mock data or real API based on the system
    let fields: string[] = [];
    
    if (system === 'ghl') {
      // For GHL, we're using mock data
      fields = getGHLMockFields(dataType);
      console.log(`Discovered ${fields.length} ${system.toUpperCase()} fields for ${dataType}:`, fields);
      return fields;
    } else {
      try {
        // For IntakeQ, attempt to fetch real fields via API
        const { intakeq_key } = await getApiKeys();
        
        if (!intakeq_key) {
          console.error('No IntakeQ API key found for field discovery');
          return getIntakeQMockFields(dataType); // Fallback to mock data
        }
        
        console.log(`Using IntakeQ API key to discover fields for ${dataType}`);
        
        // Create endpoint based on data type
        let endpoint = '';
        
        switch(dataType) {
          case 'contact':
            endpoint = 'clients';
            break;
          case 'form':
            endpoint = 'forms';
            break;
          case 'appointment':
            endpoint = 'appointments';
            break;
          default:
            endpoint = 'clients';
        }
        
        // Call IntakeQ API with correct format /api/v1/
        const { data, error } = await supabase.functions.invoke('proxy', {
          body: {
            url: `https://intakeq.com/api/v1/${endpoint}?limit=10`,
            method: 'GET',
            headers: {
              'X-Auth-Key': intakeq_key
            }
          }
        });
        
        if (error) {
          console.error(`Error fetching IntakeQ ${dataType} fields:`, error);
          fields = getIntakeQMockFields(dataType); // Fallback to mock data
        } else if (Array.isArray(data) && data.length > 0) {
          // Combine fields from multiple items to get a more complete set
          const allFields = new Set<string>();
          
          // Process each item in the response
          for (const item of data) {
            // Extract field names from each item
            console.log(`Processing IntakeQ ${dataType} item:`, JSON.stringify(item).substring(0, 200) + "...");
            
            // Extract all fields recursively from the object, up to a certain depth
            const extractFieldsFromItem = (obj: any, prefix = '', depth = 0): string[] => {
              if (!obj || typeof obj !== 'object' || depth > 3) return []; // Limit recursion depth
              
              return Object.entries(obj).reduce((acc: string[], [key, value]) => {
                // Skip metadata fields and _underscore fields and empty/null values
                if (key.startsWith('_') || key === 'id' || key === 'client_id' || key === 'form_id' || value === null || value === undefined) {
                  return acc;
                }
                
                const fieldName = prefix ? `${prefix}.${key}` : key;
                
                // Add the current field
                acc.push(fieldName);
                
                if (value && typeof value === 'object') {
                  if (Array.isArray(value)) {
                    // If it's an array with objects, extract fields from the first item
                    if (value.length > 0 && typeof value[0] === 'object') {
                      const arrayItemFields = extractFieldsFromItem(value[0], `${fieldName}[0]`, depth + 1);
                      acc.push(...arrayItemFields);
                    }
                  } else {
                    // If it's an object, extract nested fields
                    const nestedFields = extractFieldsFromItem(value, fieldName, depth + 1);
                    acc.push(...nestedFields);
                  }
                }
                
                return acc;
              }, []);
            };
            
            // Extract fields and add them to the set
            const itemFields = extractFieldsFromItem(item);
            itemFields.forEach(field => allFields.add(field));
            
            // Also add direct keys as fields (especially for contacts)
            Object.keys(item)
              .filter(key => !key.startsWith('_') && key !== 'id' && item[key] !== null)
              .forEach(key => allFields.add(key));
          }
          
          // For contacts specifically, add common fields that might not be in the sample data
          if (dataType === 'contact') {
            ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 
             'zipCode', 'postalCode', 'dateOfBirth', 'dob', 'gender', 'notes', 'customFields', 
             'Name', 'Email', 'Phone', 'Address', 'DateOfBirth', 'clientName', 'clientEmail',
             'emailAddress', 'phoneNumber', 'mobilePhone', 'homePhone', 'workPhone',
             'addressLine1', 'addressLine2', 'country', 'createdAt', 'updatedAt'].forEach(field => allFields.add(field));
          }
          
          // Also include fields with common case variations (camelCase, PascalCase, snake_case)
          const addCaseVariations = (field: string) => {
            // Only add variations for simple field names (not paths with dots)
            if (!field.includes('.')) {
              // camelCase to PascalCase
              if (field.charAt(0).toLowerCase() === field.charAt(0)) {
                const pascalCase = field.charAt(0).toUpperCase() + field.slice(1);
                allFields.add(pascalCase);
              }
              
              // PascalCase to camelCase
              if (field.charAt(0).toUpperCase() === field.charAt(0)) {
                const camelCase = field.charAt(0).toLowerCase() + field.slice(1);
                allFields.add(camelCase);
              }
              
              // Convert to snake_case
              const snakeCase = field.replace(/([A-Z])/g, '_$1').toLowerCase();
              if (snakeCase !== field) allFields.add(snakeCase);
            }
          };
          
          // Add case variations for all fields
          Array.from(allFields).forEach(addCaseVariations);
          
          // Convert the set to an array
          fields = Array.from(allFields);
          console.log(`Extracted ${fields.length} fields from IntakeQ ${dataType} items:`, fields);
          
          // If we still couldn't extract any fields, fall back to mock data
          if (fields.length === 0) {
            console.warn(`No fields found in real IntakeQ ${dataType} data, using mock data`);
            fields = getIntakeQMockFields(dataType);
          }
        } else if (data?._error || data?._statusCode >= 400) {
          console.warn(`IntakeQ API error for ${dataType}: ${data?._errorMessage || 'Unknown error'}`);
          fields = getIntakeQMockFields(dataType); // Fallback to mock data
        } else {
          console.warn(`No ${dataType} data returned from IntakeQ API, using mock data`);
          fields = getIntakeQMockFields(dataType); // Fallback to mock data
        }
      } catch (error) {
        console.error(`Error discovering IntakeQ ${dataType} fields:`, error);
        fields = getIntakeQMockFields(dataType); // Fallback to mock data
      }
    }
    
    // Log the results for debugging
    console.log(`Discovered ${fields.length} ${system.toUpperCase()} fields for ${dataType}:`, fields);
    
    // Return all discovered fields
    return fields;
  }
};
