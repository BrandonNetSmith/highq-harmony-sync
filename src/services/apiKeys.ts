
import { createClient } from '@supabase/supabase-js';

// Create a more robust client initialization with fallbacks and error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the required environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please ensure your Supabase integration is properly set up.');
}

// Create the client only if we have the required values
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const saveApiKeys = async (ghlApiKey: string, intakeqApiKey: string) => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.');
  }

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
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.');
  }

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
