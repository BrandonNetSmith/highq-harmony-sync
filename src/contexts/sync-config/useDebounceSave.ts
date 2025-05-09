
import { useRef, useEffect } from 'react';
import { saveSyncConfig } from '@/services/syncConfig';
import { sonnerToast as toast } from "sonner";

// Avoid excessive saves with a debounce timer
const SAVE_DEBOUNCE_MS = 500;

export interface PendingSave {
  config: any;
  showToast: boolean;
}

export const useDebounceSave = () => {
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<PendingSave | null>(null);

  const debouncedSave = async (config: any, showToast = false) => {
    // Store the latest config to be saved
    pendingSaveRef.current = { config, showToast };
    
    // Clear any existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Create new timer
    saveTimerRef.current = setTimeout(async () => {
      // Get the latest pending save
      const pendingSave = pendingSaveRef.current;
      if (!pendingSave) return;
      
      try {
        console.log('Saving config to database:', pendingSave.config);
        await saveSyncConfig(pendingSave.config);
        
        if (pendingSave.showToast) {
          toast.success("Configuration saved");
        }
        
        // Clear the pending save
        pendingSaveRef.current = null;
      } catch (error) {
        console.error('Failed to save config:', error);
        toast.error("Failed to save configuration");
      } finally {
        saveTimerRef.current = null;
      }
    }, SAVE_DEBOUNCE_MS);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return { debouncedSave };
};
