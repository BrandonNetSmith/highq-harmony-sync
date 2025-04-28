
import React from 'react';
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SyncNowButtonProps {
  isSyncing: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const SyncNowButton = ({ isSyncing, disabled, onClick }: SyncNowButtonProps) => {
  return (
    <Button 
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isSyncing}
      className="flex items-center gap-2"
    >
      <ArrowRightLeft className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? "Syncing..." : "Sync Now"}
    </Button>
  );
};
