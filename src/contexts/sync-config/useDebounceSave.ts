
import { useState } from 'react';
import { saveSyncConfig } from '@/services/syncConfig';
import { toast } from "@/hooks/use-toast";

// Define the Timeout type to match NodeJS.Timeout
type Timeout = ReturnType<typeof setTimeout>;

export function useDebounceSave() {
  const [debounceTimer, setDebounceTimer] = useState<Timeout | null>(null);

  const debouncedSave = async (configData: any, showToast = true) => {
    // Clear any existing timers
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    
    // Set a new timer
    const timer = setTimeout(async () => {
      try {
        console.log('Saving config data:', configData);
        
        // Ensure field_mapping is properly formatted for storage
        if (configData.field_mapping) {
          console.log('Field mapping before save:', JSON.stringify(configData.field_mapping));
        }
        
        await saveSyncConfig(configData);
        
        if (showToast) {
          toast({
            title: "Success",
            description: "Configuration saved successfully",
          });
        }
      } catch (error) {
        console.error('Error in debouncedSave:', error);
        toast({
          title: "Error",
          description: "Failed to save configuration",
          variant: "destructive",
        });
      }
    }, 1000);
    
    setDebounceTimer(timer);
  };
  
  return { debouncedSave };
}
