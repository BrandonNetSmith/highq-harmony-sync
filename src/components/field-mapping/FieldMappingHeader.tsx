
import React from 'react';
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FieldMappingHeaderProps {
  isDiscovering: boolean;
  onDiscoverFields: () => Promise<void>;
}

export const FieldMappingHeader = ({
  isDiscovering,
  onDiscoverFields
}: FieldMappingHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-muted-foreground">
        Configure field mappings between GoHighLevel and IntakeQ
      </div>
      <Button
        variant={isDiscovering ? "secondary" : "outline"}
        size="sm"
        onClick={onDiscoverFields}
        disabled={isDiscovering}
        className="flex items-center gap-2"
        title="Discover available fields from both systems"
      >
        <RefreshCw className={`h-4 w-4 ${isDiscovering ? 'animate-spin' : ''}`} />
        <span>{isDiscovering ? "Discovering Fields..." : "Discover All Fields"}</span>
      </Button>
    </div>
  );
};
