
import { getGHLMockFields, getIntakeQMockFields } from '@/hooks/field-discovery/mock-field-data';
import { supabase } from "@/integrations/supabase/client";
import { getApiKeys } from "@/services/apiKeys";

/**
 * Service responsible for discovering fields from different systems
 * Currently uses mock data for GHL, but can fetch real field data from IntakeQ
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
        
        // Call IntakeQ API to get sample data (using v1 API)
        const { data, error } = await supabase.functions.invoke('proxy', {
          body: {
            url: `https://intakeq.com/api/v1/${endpoint}?limit=1`,
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
          // Extract field names from the first item
          const sampleItem = data[0];
          
          // Extra log to debug the structure of the data
          console.log(`IntakeQ ${dataType} sample data:`, JSON.stringify(sampleItem).substring(0, 500) + "...");
          
          // Extract all fields recursively from the object
          const extractFields = (obj: any, prefix = ''): string[] => {
            if (!obj || typeof obj !== 'object') return [];
            
            return Object.entries(obj).reduce((acc: string[], [key, value]) => {
              // Skip metadata fields and _underscore fields
              if (key.startsWith('_') || key === 'id' || key === 'client_id' || key === 'form_id') {
                return acc;
              }
              
              const fieldName = prefix ? `${prefix}.${key}` : key;
              
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                // If it's an object, extract nested fields
                return [...acc, ...extractFields(value, fieldName)];
              } else {
                // It's a leaf field
                return [...acc, fieldName];
              }
            }, []);
          };
          
          const extractedFields = extractFields(sampleItem);
          console.log(`Extracted fields from IntakeQ ${dataType}:`, extractedFields);
          
          // Use the extracted fields if we found any
          if (extractedFields.length > 0) {
            fields = extractedFields;
          } else {
            // If we couldn't extract fields from the object structure, use the keys directly
            // This is more of a fallback approach
            fields = Object.keys(sampleItem)
              .filter(key => !key.startsWith('_') && key !== 'id' && key !== 'client_id' && key !== 'form_id');
            
            console.log(`Using direct keys for IntakeQ ${dataType}:`, fields);
          }
          
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
