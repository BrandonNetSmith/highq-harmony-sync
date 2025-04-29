
import { useToast } from "@/hooks/use-toast";
import { fieldDiscoveryService } from "@/services/field-discovery-service";
import { useDiscoveryState } from "./field-discovery/discovery-state";
import type { DiscoverySystem, DataType } from "./field-discovery/types";
import { useState } from "react";

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
  
  // Track discovery attempts to prevent infinite retries
  const [discoveryAttempts, setDiscoveryAttempts] = useState<Record<string, number>>({});

  /**
   * Handles the discovery of fields for a specific system and data type
   */
  const handleDiscoverFields = async (system: DiscoverySystem, dataType: DataType): Promise<void> => {
    try {
      const key = `${system}_${dataType}`;
      
      // Prevent discovery if already in progress
      if (isDiscovering[key]) {
        console.log(`Discovery for ${key} already in progress, skipping`);
        return;
      }
      
      // Increment discovery attempts
      const attempts = (discoveryAttempts[key] || 0) + 1;
      setDiscoveryAttempts(prev => ({ ...prev, [key]: attempts }));
      
      if (attempts > 3) {
        toast({
          title: "Warning",
          description: `Multiple discovery attempts for ${system} ${dataType}. Using fallback data.`,
          variant: "default",
        });
      }
      
      console.log(`Starting discovery for ${system} ${dataType} (attempt ${attempts})`);
      
      // Mark the specific dataType as discovering
      setIsDiscovering(prev => ({ 
        ...prev, 
        [key]: true
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
        [key]: true
      }));

      toast({
        title: "Fields discovered",
        description: `${filteredFields.length} fields found for ${system} ${dataType}`,
      });
      
      // Log the current state after update
      console.log(`After discovery for ${key}:`, {
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
      // Clear the discovering state with a slight delay to avoid UI flashing
      setTimeout(() => {
        setIsDiscovering(prev => ({ 
          ...prev, 
          [`${system}_${dataType}`]: false
        }));
      }, 500);
    }
  };

  /**
   * This function has been removed since we're now handling individual field types
   * directly in the UI with separate buttons for each data type
   */

  return {
    isDiscovering,
    availableFields,
    discoveredFields,
    handleDiscoverFields,
  };
};
