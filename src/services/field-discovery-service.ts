
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
    
    // Get fields based on the system
    if (system === 'ghl') {
      return getGHLMockFields(dataType);
    } else {
      return getIntakeQMockFields(dataType);
    }
  }
};
