
import { getGHLMockFields, getIntakeQMockFields } from '@/hooks/field-discovery/mock-field-data';

/**
 * Service responsible for discovering fields from different systems
 * Currently uses mock data, but can be updated to use actual API calls
 */
export const fieldDiscoveryService = {
  /**
   * Discovers fields for the specified system and data type
   */
  discoverFields: async (system: 'ghl' | 'intakeq', dataType: string): Promise<string[]> => {
    console.log(`Discovering fields for ${system} ${dataType}`);
    
    // Ensure a consistent delay to avoid UI flashing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Use the corresponding mock data function based on the system
    let fields: string[] = [];
    
    if (system === 'ghl') {
      fields = getGHLMockFields(dataType);
    } else {
      fields = getIntakeQMockFields(dataType);
    }
    
    // Log the results for debugging
    console.log(`Discovered ${fields.length} ${system.toUpperCase()} fields for ${dataType}:`, fields);
    
    // Return all discovered fields
    return fields;
  }
};
