
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

export const saveSyncConfig = async (config: Partial<SyncConfig>) => {
  try {
    // First, check if there's an existing config to get the ID
    if (!config.id) {
      const { data: existingConfig } = await supabase
        .from('sync_config')
        .select('id')
        .limit(1)
        .maybeSingle();
      
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
    
    const { error } = await supabase
      .from('sync_config')
      .upsert([{
        id: config.id,
        sync_direction: config.sync_direction,
        ghl_filters: ghl_filters,
        intakeq_filters: intakeq_filters,
        is_sync_enabled: config.is_sync_enabled,
        field_mapping: field_mapping
      }]);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to save sync configuration: ${error.message}`);
    }
  } catch (error) {
    console.error('Error saving sync config:', error);
    throw error;
  }
};

export const getSyncConfig = async () => {
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
};
