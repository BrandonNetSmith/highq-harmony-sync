
import React from 'react';
import { ArrowLeft, ArrowRight, ArrowLeftRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

interface SyncControlsProps {
  isEnabled: boolean;
  direction: SyncDirection;
  onToggle: (enabled: boolean) => void;
  onDirectionChange: (direction: SyncDirection) => void;
  disabled?: boolean;
}

export const SyncControls = ({
  isEnabled,
  direction,
  onToggle,
  onDirectionChange,
  disabled
}: SyncControlsProps) => {
  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center gap-2">
        <Switch
          checked={isEnabled}
          onCheckedChange={onToggle}
          disabled={disabled}
          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
        />
        <span className="text-sm font-medium">
          {isEnabled ? "Sync Enabled" : "Sync Disabled"}
        </span>
      </div>
      
      <div className="flex flex-col w-full gap-1">
        <div className="text-sm font-medium mb-1">Sync Direction</div>
        <ToggleGroup
          type="single"
          size="sm"
          value={direction}
          onValueChange={(value: any) => {
            if (value) onDirectionChange(value);
          }}
          className="flex gap-0 border rounded-md overflow-hidden shadow-sm"
          disabled={disabled || !isEnabled}
        >
          <ToggleGroupItem 
            value="one_way_intakeq_to_ghl"
            aria-label="IntakeQ to GHL"
            className="px-2 rounded-none border-r data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="bidirectional"
            aria-label="Bidirectional"
            className="px-2 rounded-none border-r data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="one_way_ghl_to_intakeq"
            aria-label="GHL to IntakeQ"
            className="px-2 rounded-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <ArrowRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};
