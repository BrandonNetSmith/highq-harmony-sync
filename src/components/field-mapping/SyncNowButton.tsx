import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { performSync } from '@/services/syncService';
import { toast } from "sonner";

interface SyncNowButtonProps {
  isSyncing: boolean;
  disabled?: boolean;
  onClick?: () => Promise<void>;
  syncDirection?: 'ghl_to_intakeq' | 'intakeq_to_ghl' | 'bidirectional';
}

export const SyncNowButton = ({
  isSyncing,
  disabled,
  onClick,
  syncDirection
}: SyncNowButtonProps) => {
  const handleSyncClick = async () => {
    try {
      if (onClick) {
        // Use custom handler if provided
        await onClick();
      } else {
        // Otherwise use the default sync service
        await performSync(syncDirection);
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error(`Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="default"
          size="sm"
          disabled={disabled || isSyncing}
          onClick={handleSyncClick}
          className="whitespace-nowrap"
        >
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            'Sync Now'
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Run synchronization now</p>
      </TooltipContent>
    </Tooltip>
  );
};
