
import { supabase } from "@/integrations/supabase/client";

export const saveApiKeys = async (ghlApiKey: string, intakeqApiKey: string) => {
  const { error } = await supabase
    .from('api_keys')
    .upsert([
      {
        id: 1, // Single record for the app
        ghl_key: ghlApiKey,
        intakeq_key: intakeqApiKey
      }
    ]);

  if (error) throw error;
};

export const getApiKeys = async () => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('ghl_key, intakeq_key')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is the error when no rows returned
    throw error;
  }
  
  return data || { ghl_key: '', intakeq_key: '' };
};
