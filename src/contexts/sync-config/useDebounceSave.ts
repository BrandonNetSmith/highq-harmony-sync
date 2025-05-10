
// Helper hook for debouncing config saves
import { useRef, useEffect } from 'react';
import { saveSyncConfig } from '@/services/syncConfig';
import { toast } from "sonner";

// Avoid excessive saves with a debounce timer
export const useDebounceSave = () => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear the timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced save function
  const debouncedSave = <T extends {}>(config: T, delay: number = 1000) => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Start new timer
    debounceTimerRef.current = setTimeout(async () => {
      try {
        console.log('Saving sync config:', config);
        await saveSyncConfig(config);
      } catch (error) {
        console.error('Error saving config:', error);
        toast.error(`Error saving configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, delay);
  };

  return { debouncedSave };
};
