
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getSyncConfig } from '@/services/syncConfig';
import { SyncConfigContext } from './SyncConfigContext';
import { useDebounceSave } from './useDebounceSave';
import { processFieldMapping } from './processFieldMapping';
import { initialSyncConfig, SyncDirection } from './types';
import type { FieldMappingType } from '@/types/field-mapping';

export const SyncConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [syncConfig, setSyncConfig] = useState(initialSyncConfig);
  const { debouncedSave } = useDebounceSave();

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      try {
        const config = await getSyncConfig();
        if (config) {
          // Process field mapping
          const fieldMapping = processFieldMapping(config.field_mapping);
          
          setSyncConfig({
            sync_direction: config.sync_direction,
            ghl_filters: typeof config.ghl_filters === 'string' 
              ? JSON.parse(config.ghl_filters) 
              : config.ghl_filters as any,
            intakeq_filters: typeof config.intakeq_filters === 'string' 
              ? JSON.parse(config.intakeq_filters) 
              : config.intakeq_filters as any,
            is_sync_enabled: config.is_sync_enabled,
            field_mapping: fieldMapping
          });
          console.log('Loaded field mapping:', fieldMapping);
        }
      } catch (error) {
        console.error('Failed to load sync config:', error);
        toast({
          title: "Error",
          description: "Failed to load sync configuration",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  const handleSyncDirectionChange = async (direction: SyncDirection) => {
    try {
      const newConfig = {
        ...syncConfig,
        sync_direction: direction
      };
      
      debouncedSave(newConfig);
      // Update local state immediately for UI responsiveness
      setSyncConfig(prev => ({ ...prev, sync_direction: direction }));
      toast({
        title: "Success",
        description: "Sync direction updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sync direction",
        variant: "destructive",
      });
    }
  };

  const handleFiltersChange = async (
    type: 'ghl' | 'intakeq',
    filters: typeof syncConfig.ghl_filters | typeof syncConfig.intakeq_filters
  ) => {
    try {
      const newConfig = {
        ...syncConfig,
        [type === 'ghl' ? 'ghl_filters' : 'intakeq_filters']: filters
      };
      
      // Update local state immediately for UI responsiveness
      setSyncConfig(newConfig);
      
      // Save changes with debounce
      debouncedSave(newConfig);
      
      // Provide feedback about what this filter configuration means
      if (type === 'intakeq') {
        const intakeqFilters = filters as typeof syncConfig.intakeq_filters;
        let message = "Filter settings updated: ";
        
        if (intakeqFilters.clientIds.length === 0 && intakeqFilters.formIds.length === 0) {
          message += "All IntakeQ data will be synchronized";
        } else {
          const parts = [];
          if (intakeqFilters.clientIds.length > 0) {
            parts.push(`${intakeqFilters.clientIds.length} specific client(s)`);
          }
          if (intakeqFilters.formIds.length > 0) {
            parts.push(`${intakeqFilters.formIds.length} specific form(s)`);
          }
          message += "Only synchronizing " + parts.join(" and ");
        }
        
        toast({
          title: "Filters Updated",
          description: message,
        });
      } else {
        toast({
          title: "Success",
          description: "Filters updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update filters",
        variant: "destructive",
      });
    }
  };

  const handleFieldMappingChange = async (fieldMapping: FieldMappingType) => {
    try {
      console.log('handleFieldMappingChange called with:', fieldMapping);
      
      // For each dataType, check if there's a field with isKeyField=true
      // If so, update the keyField property for that dataType
      const updatedFieldMapping = { ...fieldMapping };
      
      Object.keys(updatedFieldMapping).forEach(dataType => {
        const dataTypeObj = updatedFieldMapping[dataType];
        
        // Find a field with isKeyField=true
        const keyFieldEntry = Object.entries(dataTypeObj.fields).find(
          ([_, fieldSettings]) => fieldSettings.isKeyField
        );
        
        if (keyFieldEntry) {
          // Update the keyField property
          updatedFieldMapping[dataType].keyField = keyFieldEntry[0];
          
          // Ensure no other field is marked as a key field
          Object.entries(dataTypeObj.fields).forEach(([fieldName, settings]) => {
            if (fieldName !== keyFieldEntry[0] && settings.isKeyField) {
              updatedFieldMapping[dataType].fields[fieldName] = {
                ...settings,
                isKeyField: false
              };
            }
          });
        }
      });
      
      const newConfig = {
        ...syncConfig,
        field_mapping: updatedFieldMapping
      };
      
      console.log('Saving updated field mapping:', updatedFieldMapping);
      
      // Update local state immediately for UI responsiveness
      setSyncConfig(newConfig);
      
      // Save changes with debounce and NO toast notification to avoid flooding
      debouncedSave(newConfig);

      console.log('Field mapping update completed');
    } catch (error) {
      console.error('Error updating field mapping:', error);
      toast({
        title: "Error",
        description: "Failed to update field mapping",
        variant: "destructive",
      });
    }
  };

  const value = {
    syncConfig,
    isLoading,
    handleSyncDirectionChange,
    handleFiltersChange,
    handleFieldMappingChange
  };

  return (
    <SyncConfigContext.Provider value={value}>
      {children}
    </SyncConfigContext.Provider>
  );
};
