
import { useState, useRef, useCallback } from 'react';
import { saveSyncConfig } from '@/services/syncConfig';
import { toast } from "@/hooks/use-toast";

export function useDebounceSave() {
  const [isSaving, setIsSaving] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback(async (configData: any, showToast = true) => {
    console.log('=== DEBOUNCED SAVE TRIGGERED ===');
    console.log('Config data to save:', JSON.stringify(configData, null, 2));
    console.log('Show toast:', showToast);
    
    // Clear any existing timers
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      console.log('Cleared existing debounce timer');
    }
    
    // Set saving state
    setIsSaving(true);
    
    // Set a new timer
    debounceTimerRef.current = setTimeout(async () => {
      try {
        console.log('=== EXECUTING DEBOUNCED SAVE ===');
        console.log('Final data being saved:', JSON.stringify(configData, null, 2));
        
        // Ensure field_mapping is properly formatted for storage
        if (configData.field_mapping) {
          console.log('Field mapping before save:', JSON.stringify(configData.field_mapping, null, 2));
        }
        
        await saveSyncConfig(configData);
        console.log('=== DEBOUNCED SAVE COMPLETED SUCCESSFULLY ===');
        
        if (showToast) {
          toast({
            title: "Success",
            description: "Configuration saved successfully",
          });
        }
      } catch (error) {
        console.error('=== DEBOUNCED SAVE FAILED ===');
        console.error('Error in debouncedSave:', error);
        toast({
          title: "Error",
          description: "Failed to save configuration",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
        debounceTimerRef.current = null;
      }
    }, 1000);
    
    console.log('Debounce timer set for config save');
  }, []);
  
  return { debouncedSave, isSaving };
}
