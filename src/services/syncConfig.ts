
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];
export type SyncConfig = Database["public"]["Tables"]["sync_config"]["Row"];

export const saveSyncConfig = async (config: Partial<SyncConfig>) => {
  const { error } = await supabase
    .from('sync_config')
    .upsert([{
      id: config.id || undefined,
      sync_direction: config.sync_direction,
      ghl_filters: config.ghl_filters,
      intakeq_filters: config.intakeq_filters,
      is_sync_enabled: config.is_sync_enabled,
      field_mapping: config.field_mapping
    }]);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to save sync configuration: ${error.message}`);
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
