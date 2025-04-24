
import { createClient } from '@supabase/supabase-js';

// This uses the env variables that Lovable automatically sets up
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

  if (error) throw error;
  return data;
};
