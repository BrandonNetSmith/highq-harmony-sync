
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];
export type SyncConfig = Database["public"]["Tables"]["sync_config"]["Row"];

export type FieldMappingType = {
  [dataType: string]: {
    fields: {
      [fieldName: string]: {
        sync: boolean;
        direction: SyncDirection;
        ghlField?: string;
        intakeqField?: string;
      }
    }
  }
}

/**
 * Saves sync configuration to the database
 * @param config The sync configuration to save
 * @returns Promise that resolves when the save is complete
 */
export const saveSyncConfig = async (config: Partial<SyncConfig>) => {
  try {
    // First, check if there's an existing config to get the ID
    if (!config.id) {
      const { data: existingConfig, error: fetchError } = await supabase
        .from('sync_config')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching existing config:', fetchError);
        throw new Error(`Failed to fetch existing sync configuration: ${fetchError.message}`);
      }
      
      if (existingConfig) {
        config.id = existingConfig.id;
      } else {
        // If no config exists yet, create one with a UUID
        config.id = crypto.randomUUID();
      }
    }
    
    // Make sure to stringify JSON fields if they aren't strings already
    const field_mapping = typeof config.field_mapping === 'object' && config.field_mapping !== null
      ? JSON.stringify(config.field_mapping)
      : config.field_mapping;
      
    const ghl_filters = typeof config.ghl_filters === 'object' && config.ghl_filters !== null
      ? JSON.stringify(config.ghl_filters)
      : config.ghl_filters;
      
    const intakeq_filters = typeof config.intakeq_filters === 'object' && config.intakeq_filters !== null
      ? JSON.stringify(config.intakeq_filters)
      : config.intakeq_filters;
    
    // Construct the record to be saved
    const recordToSave: any = {
      id: config.id
    };
    
    // Only include fields that are provided in the config
    if (config.sync_direction !== undefined) {
      recordToSave.sync_direction = config.sync_direction;
    }
    
    if (ghl_filters !== undefined) {
      recordToSave.ghl_filters = ghl_filters;
    }
    
    if (intakeq_filters !== undefined) {
      recordToSave.intakeq_filters = intakeq_filters;
    }
    
    if (config.is_sync_enabled !== undefined) {
      recordToSave.is_sync_enabled = config.is_sync_enabled;
    }
    
    if (field_mapping !== undefined) {
      recordToSave.field_mapping = field_mapping;
    }
    
    const { error } = await supabase
      .from('sync_config')
      .upsert([recordToSave]);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to save sync configuration: ${error.message}`);
    }
  } catch (error) {
    console.error('Error saving sync config:', error);
    throw error;
  }
};

/**
 * Retrieves the sync configuration from the database
 * @returns The sync configuration object
 */
export const getSyncConfig = async (): Promise<SyncConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('sync_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting sync config:', error);
    throw error;
  }
};
