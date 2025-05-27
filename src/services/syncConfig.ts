
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SyncConfig } from "@/types/sync-config";

/**
 * Saves sync configuration to the database
 * @param config The sync configuration to save
 * @returns Promise that resolves when the save is complete
 */
export const saveSyncConfig = async (config: Partial<SyncConfig>) => {
  try {
    console.log('=== SAVE SYNC CONFIG STARTED ===');
    console.log('Input config:', JSON.stringify(config, null, 2));
    
    // First, check if there's an existing config to get the ID
    if (!config.id) {
      console.log('No ID provided, checking for existing config...');
      const { data: existingConfig, error: fetchError } = await supabase
        .from('sync_config')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching existing config:', fetchError);
        toast.error(`Failed to fetch existing sync configuration: ${fetchError.message}`);
        throw new Error(`Failed to fetch existing sync configuration: ${fetchError.message}`);
      }
      
      if (existingConfig) {
        config.id = existingConfig.id;
        console.log('Using existing config ID:', config.id);
      } else {
        // If no config exists yet, create one with a UUID
        config.id = crypto.randomUUID();
        console.log('Generated new config ID:', config.id);
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
    
    console.log('Processed field_mapping for DB:', field_mapping);
    console.log('Processed ghl_filters for DB:', ghl_filters);
    console.log('Processed intakeq_filters for DB:', intakeq_filters);
    
    // Construct the record to be saved
    const recordToSave: any = {
      id: config.id
    };
    
    // Only include fields that are provided in the config
    if (config.sync_direction !== undefined) {
      recordToSave.sync_direction = config.sync_direction;
      console.log('Adding sync_direction to save:', config.sync_direction);
    }
    
    if (ghl_filters !== undefined) {
      recordToSave.ghl_filters = ghl_filters;
      console.log('Adding ghl_filters to save');
    }
    
    if (intakeq_filters !== undefined) {
      recordToSave.intakeq_filters = intakeq_filters;
      console.log('Adding intakeq_filters to save');
    }
    
    if (config.is_sync_enabled !== undefined) {
      recordToSave.is_sync_enabled = config.is_sync_enabled;
      console.log('Adding is_sync_enabled to save:', config.is_sync_enabled);
    }
    
    if (field_mapping !== undefined) {
      recordToSave.field_mapping = field_mapping;
      console.log('Adding field_mapping to save');
    }
    
    console.log('Final record being saved to DB:', JSON.stringify(recordToSave, null, 2));
    
    const { data, error } = await supabase
      .from('sync_config')
      .upsert([recordToSave])
      .select();

    if (error) {
      console.error('=== SUPABASE UPSERT ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error hint:', error.hint);
      
      toast.error(`Failed to save sync configuration: ${error.message}`);
      throw new Error(`Failed to save sync configuration: ${error.message}`);
    }

    console.log('=== SAVE SYNC CONFIG SUCCESS ===');
    console.log('Saved data:', data);
    
    toast.success("Sync configuration saved successfully");
    console.log('Database save operation completed successfully');
    
    return data;
  } catch (error) {
    console.error('=== SAVE SYNC CONFIG FAILED ===');
    console.error('Error saving sync config:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    toast.error(`Error saving sync config: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

/**
 * Retrieves the sync configuration from the database
 * @returns The sync configuration object
 */
export const getSyncConfig = async (): Promise<SyncConfig | null> => {
  try {
    console.log('Getting sync config from database...');
    
    const { data, error } = await supabase
      .from('sync_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Supabase error while getting config:', error);
      toast.error(`Failed to retrieve sync configuration: ${error.message}`);
      throw error;
    }

    console.log('Retrieved sync config from DB:', data);
    return data;
  } catch (error) {
    console.error('Error getting sync config:', error);
    toast.error(`Error getting sync config: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};
