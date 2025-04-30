
import React from 'react';
import { Switch } from "@/components/ui/switch";

interface AutoSyncToggleProps {
  isEnabled: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export const AutoSyncToggle = ({ isEnabled, disabled, onToggle }: AutoSyncToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isEnabled}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
      />
      <span className="text-sm font-medium">
        {isEnabled ? "Auto-Sync On" : "Auto-Sync Off"}
      </span>
    </div>
  );
};
