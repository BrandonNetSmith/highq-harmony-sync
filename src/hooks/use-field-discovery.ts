
import { useState, useCallback } from 'react';
import { toast } from "sonner";
import { getAvailableFields } from '@/services/field-discovery-service';
import { useQuery } from '@tanstack/react-query';

export interface FieldDiscoveryState {
  isDiscovering: boolean;
  availableFields: {
    ghl: { [key: string]: string[] };
    intakeq: { [key: string]: string[] };
  };
  discoveredFields: Record<string, boolean>;
  handleDiscoverFields: () => Promise<void>;
}

export const useFieldDiscovery = (): FieldDiscoveryState => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredFields, setDiscoveredFields] = useState<Record<string, boolean>>({});

  // Automatically fetch available fields on component mount
  const { data: availableFields = { ghl: {}, intakeq: {} }, refetch } = useQuery({
    queryKey: ['available-fields'],
    queryFn: async () => {
      console.log('Auto-discovering fields on page load...');
      setIsDiscovering(true);
      
      try {
        const fields = await getAvailableFields();
        console.log('Auto-discovery successful:', fields);
        
        // Mark all data types as discovered
        const discovered: Record<string, boolean> = {};
        Object.keys(fields.ghl).forEach(dataType => {
          discovered[`ghl_${dataType}`] = true;
        });
        Object.keys(fields.intakeq).forEach(dataType => {
          discovered[`intakeq_${dataType}`] = true;
        });
        
        setDiscoveredFields(discovered);
        return fields;
      } catch (error) {
        console.error('Auto-discovery failed:', error);
        toast.error('Failed to discover available fields automatically');
        return { ghl: {}, intakeq: {} };
      } finally {
        setIsDiscovering(false);
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  });

  const handleDiscoverFields = useCallback(async () => {
    console.log('Manual field discovery triggered...');
    setIsDiscovering(true);
    
    try {
      await refetch();
      toast.success('Field discovery completed successfully');
    } catch (error) {
      console.error('Manual field discovery failed:', error);
      toast.error('Failed to discover fields');
    } finally {
      setIsDiscovering(false);
    }
  }, [refetch]);

  return {
    isDiscovering,
    availableFields,
    discoveredFields,
    handleDiscoverFields,
  };
};
