
import React from 'react';
import { SyncControls } from '../SyncControls';
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

interface SyncToggleControlsProps {
  isEnabled: boolean;
  direction: SyncDirection | null;
  onToggle: (checked: boolean) => void;
  onDirectionChange: (direction: SyncDirection) => void;
  disabled?: boolean;
  displayToggle?: boolean;
  displayDirectionControls?: boolean;
  centerDirectionControls?: boolean;
}

export const SyncToggleControls = ({
  isEnabled,
  direction,
  onToggle,
  onDirectionChange,
  disabled,
  displayToggle = true,
  displayDirectionControls = true,
  centerDirectionControls = false
}: SyncToggleControlsProps) => {
  // Use bidirectional as the default direction if none is provided
  const syncDirection = direction || 'bidirectional';

  return (
    <SyncControls
      isEnabled={isEnabled}
      direction={syncDirection}
      onToggle={onToggle}
      onDirectionChange={onDirectionChange}
      disabled={disabled}
      displayToggle={displayToggle}
      displayDirectionControls={displayDirectionControls}
      centerDirectionControls={centerDirectionControls}
    />
  );
};
