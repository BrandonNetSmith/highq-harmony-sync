
import { useState } from 'react';
import { saveSyncConfig } from '@/services/syncConfig';
import { toast } from "@/hooks/use-toast";

export function useDebounceSave() {
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

  const debouncedSave = async (configData: any, showToast = false) => {
    // Clear any existing timers
    if (debounceTimer !== null) {
      window.clearTimeout(debounceTimer);
    }
    
    // Set a new timer
    const timer = window.setTimeout(async () => {
      try {
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
