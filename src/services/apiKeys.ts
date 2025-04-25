
import { supabase } from "@/integrations/supabase/client";

export const saveApiKeys = async (ghlApiKey: string, intakeqApiKey: string) => {
  // First check if there's an existing record
  const { data } = await supabase
    .from('api_keys')
    .select('id')
    .limit(1);
  
  const id = data && data.length > 0 ? data[0].id : 1;

  const { error } = await supabase
    .from('api_keys')
    .upsert([
      {
        id: id, // Use existing ID or default to 1
        ghl_key: ghlApiKey,
        intakeq_key: intakeqApiKey
      }
    ], {
      onConflict: 'id'
    });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to save API keys: ${error.message}`);
  }
};

export const getApiKeys = async () => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('ghl_key, intakeq_key')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  
  return data || { ghl_key: '', intakeq_key: '' };
};
