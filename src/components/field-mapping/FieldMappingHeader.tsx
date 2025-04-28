
import React from 'react';
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

interface FieldMappingHeaderProps {
  isDiscovering: Record<string, boolean>;
  onDiscoverFields: (system: 'ghl' | 'intakeq', dataType: string) => void;
}

export const FieldMappingHeader = ({
  isDiscovering,
  onDiscoverFields
}: FieldMappingHeaderProps) => {
  // Check if discovering is happening for a specific system
  const isGhlDiscovering = isDiscovering['ghl'] || false;
  const isIntakeqDiscovering = isDiscovering['intakeq'] || false;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4">
      <div className="flex flex-col gap-2">
        <div className="bg-muted/30 p-3 font-semibold text-center rounded-md">GoHighLevel</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDiscoverFields('ghl', 'contact')}
          disabled={isGhlDiscovering}
          className="flex items-center gap-2 self-start"
          title="This will update ONLY the GHL field options"
        >
          <RefreshCw className={`h-4 w-4 ${isGhlDiscovering ? 'animate-spin' : ''}`} />
          <span>Discover GHL Fields</span>
        </Button>
      </div>
      <div className="flex items-center justify-center font-medium">Sync Direction</div>
      <div className="flex flex-col gap-2 items-end">
        <div className="bg-muted/30 p-3 font-semibold text-center rounded-md w-full">IntakeQ</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDiscoverFields('intakeq', 'contact')}
          disabled={isIntakeqDiscovering}
          className="flex items-center gap-2"
          title="This will update ONLY the IntakeQ field options"
        >
          <RefreshCw className={`h-4 w-4 ${isIntakeqDiscovering ? 'animate-spin' : ''}`} />
          <span>Discover IntakeQ Fields</span>
        </Button>
      </div>
    </div>
  );
};
