
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getSyncConfig, saveSyncConfig } from '@/services/syncConfig';
import type { Database } from "@/integrations/supabase/types";
import type { FieldMappingType } from '@/types/field-mapping';

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

interface SyncConfigContextType {
  syncConfig: {
    sync_direction: SyncDirection;
    ghl_filters: { contactIds: string[], tags: string[], status: string[] };
    intakeq_filters: { clientIds: string[], formIds: string[], status: string[] };
    is_sync_enabled: boolean;
    field_mapping: FieldMappingType;
  };
  isLoading: boolean;
  handleSyncDirectionChange: (direction: SyncDirection) => Promise<void>;
  handleFiltersChange: (type: 'ghl' | 'intakeq', filters: any) => Promise<void>;
  handleFieldMappingChange: (fieldMapping: FieldMappingType) => Promise<void>;
}

const defaultFieldMapping: FieldMappingType = {
  contact: {
    fields: {
      first_name: { sync: true, direction: 'bidirectional', ghlField: 'firstName', intakeqField: 'firstName' },
      last_name: { sync: true, direction: 'bidirectional', ghlField: 'lastName', intakeqField: 'lastName' },
      email: { sync: true, direction: 'bidirectional' },
      phone: { sync: true, direction: 'bidirectional', ghlField: 'phone', intakeqField: 'phoneNumber' },
      address: { sync: true, direction: 'bidirectional' }
    }
  },
  appointment: {
    fields: {
      datetime: { sync: true, direction: 'bidirectional', ghlField: 'startTime', intakeqField: 'appointmentDate' },
      status: { sync: true, direction: 'bidirectional' },
      notes: { sync: true, direction: 'bidirectional', ghlField: 'notes', intakeqField: 'description' }
    }
  },
  form: {
    fields: {
      name: { sync: true, direction: 'bidirectional', ghlField: 'formName', intakeqField: 'formTitle' },
      description: { sync: true, direction: 'bidirectional' },
      status: { sync: true, direction: 'bidirectional' }
    }
  }
};

const initialSyncConfig = {
  sync_direction: 'bidirectional' as SyncDirection,
  ghl_filters: { contactIds: [], tags: [], status: [] },
  intakeq_filters: { clientIds: [], formIds: [], status: [] },
  is_sync_enabled: false,
  field_mapping: defaultFieldMapping
};

const SyncConfigContext = createContext<SyncConfigContextType | undefined>(undefined);

export const useSyncConfig = () => {
  const context = useContext(SyncConfigContext);
  if (!context) {
    throw new Error('useSyncConfig must be used within a SyncConfigProvider');
  }
  return context;
};

export const SyncConfigProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [syncConfig, setSyncConfig] = useState(initialSyncConfig);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getSyncConfig();
        if (config) {
          setSyncConfig({
            sync_direction: config.sync_direction,
            ghl_filters: typeof config.ghl_filters === 'string' 
              ? JSON.parse(config.ghl_filters) 
              : config.ghl_filters as any,
            intakeq_filters: typeof config.intakeq_filters === 'string' 
              ? JSON.parse(config.intakeq_filters) 
              : config.intakeq_filters as any,
            is_sync_enabled: config.is_sync_enabled,
            field_mapping: typeof config.field_mapping === 'string'
              ? JSON.parse(config.field_mapping)
              : config.field_mapping as FieldMappingType || defaultFieldMapping
          });
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
      await saveSyncConfig({
        ...syncConfig,
        sync_direction: direction
      });
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
        
        await saveSyncConfig(newConfig);
        setSyncConfig(newConfig);
        toast({
          title: "Filters Updated",
          description: message,
        });
      } else {
        await saveSyncConfig(newConfig);
        setSyncConfig(newConfig);
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
      const newConfig = {
        ...syncConfig,
        field_mapping: fieldMapping
      };
      await saveSyncConfig(newConfig);
      setSyncConfig(newConfig);
      toast({
        title: "Success",
        description: "Field mapping updated successfully",
      });
    } catch (error) {
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
