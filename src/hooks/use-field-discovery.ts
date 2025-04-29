
import { useToast } from "@/hooks/use-toast";
import { fieldDiscoveryService } from "@/services/field-discovery-service";
import { useDiscoveryState } from "./field-discovery/discovery-state";
import type { DiscoverySystem, DataType } from "./field-discovery/types";

/**
 * Hook for discovering and managing fields from different systems
 */
export const useFieldDiscovery = () => {
  const { toast } = useToast();
  const {
    isDiscovering,
    setIsDiscovering,
    discoveredFields,
    setDiscoveredFields,
    availableFields,
    setAvailableFields
  } = useDiscoveryState();

  /**
   * Handles the discovery of fields for a specific system and data type
   */
  const handleDiscoverFields = async (system: DiscoverySystem, dataType: DataType): Promise<void> => {
    try {
      console.log(`Starting discovery for ${system} ${dataType}`);
      
      // Mark the specific dataType as discovering
      setIsDiscovering(prev => ({ 
        ...prev, 
        [`${system}_${dataType}`]: true
      }));
      
      // Discover fields for the selected system and dataType
      const newFields = await fieldDiscoveryService.discoverFields(system, dataType);
      console.log(`Discovery completed for ${system} ${dataType}:`, newFields);
      
      // Filter out any empty values
      const filteredFields = newFields.filter(field => !!field);
      
      // Update the fields for the specific system and dataType
      setAvailableFields(prev => {
        const updated = { ...prev };
        updated[system] = {
          ...updated[system],
          [dataType]: filteredFields
        };
        return updated;
      });

      // Mark this system and dataType as having been discovered
      setDiscoveredFields(prev => ({
        ...prev,
        [`${system}_${dataType}`]: true
      }));

      toast({
        title: "Fields discovered",
        description: `${filteredFields.length} fields found for ${system} ${dataType}`,
      });
      
      // Log the current state after update
      console.log(`After discovery for ${system}_${dataType}:`, {
        availableFields: filteredFields,
        isDiscovered: true
      });
    } catch (error) {
      console.error(`Error discovering fields for ${system} ${dataType}:`, error);
      toast({
        title: "Error",
        description: `Failed to discover fields for ${system} ${dataType}`,
        variant: "destructive",
      });
    } finally {
      // Clear the discovering state
      setIsDiscovering(prev => ({ 
        ...prev, 
        [`${system}_${dataType}`]: false
      }));
    }
  };

  /**
   * Handles the discovery of all fields for a specific system
   */
  const handleDiscoverAllFields = async (system: DiscoverySystem): Promise<void> => {
    try {
      console.log(`Starting discovery for all ${system} fields`);
      
      // Mark all data types for this system as discovering
      setIsDiscovering(prev => ({ 
        ...prev, 
        [`${system}_contact`]: true,
        [`${system}_appointment`]: true,
        [`${system}_form`]: true
      }));
      
      // Discover fields for all data types in parallel
      const [contactFields, appointmentFields, formFields] = await Promise.all([
        fieldDiscoveryService.discoverFields(system, 'contact'),
        fieldDiscoveryService.discoverFields(system, 'appointment'),
        fieldDiscoveryService.discoverFields(system, 'form')
      ]);
      
      console.log(`Discovery completed for all ${system} fields`);
      
      // Filter out any empty values
      const filteredContactFields = contactFields.filter(field => !!field);
      const filteredAppointmentFields = appointmentFields.filter(field => !!field);
      const filteredFormFields = formFields.filter(field => !!field);
      
      // Update the fields for all data types at once
      setAvailableFields(prev => {
        const updated = { ...prev };
        updated[system] = {
          ...updated[system],
          contact: filteredContactFields,
          appointment: filteredAppointmentFields,
          form: filteredFormFields
        };
        return updated;
      });

      // Mark all data types as having been discovered
      setDiscoveredFields(prev => ({
        ...prev,
        [`${system}_contact`]: true,
        [`${system}_appointment`]: true,
        [`${system}_form`]: true
      }));

      toast({
        title: "Fields discovered",
        description: `Successfully discovered all field types for ${system}`,
      });
    } catch (error) {
      console.error(`Error discovering all fields for ${system}:`, error);
      toast({
        title: "Error",
        description: `Failed to discover fields for ${system}`,
        variant: "destructive",
      });
    } finally {
      // Clear all discovering states for this system
      setIsDiscovering(prev => ({ 
        ...prev, 
        [`${system}_contact`]: false,
        [`${system}_appointment`]: false,
        [`${system}_form`]: false
      }));
    }
  };

  return {
    isDiscovering,
    availableFields,
    discoveredFields,
    handleDiscoverFields,
    handleDiscoverAllFields
  };
};
