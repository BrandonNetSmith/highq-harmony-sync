
import React from 'react';
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FieldMappingHeaderProps {
  isDiscovering: Record<string, boolean>;
  onDiscoverFields: (system: 'ghl' | 'intakeq', dataType: string) => void;
}

export const FieldMappingHeader = ({
  isDiscovering,
  onDiscoverFields
}: FieldMappingHeaderProps) => {
  // Check if discovering is happening for GHL fields
  const isGhlContactDiscovering = isDiscovering['ghl_contact'] || false;
  const isGhlAppointmentDiscovering = isDiscovering['ghl_appointment'] || false;
  const isGhlFormDiscovering = isDiscovering['ghl_form'] || false;
  const isAnyGhlDiscovering = isGhlContactDiscovering || isGhlAppointmentDiscovering || isGhlFormDiscovering;

  // Check if discovering is happening for IntakeQ fields
  const isIntakeqContactDiscovering = isDiscovering['intakeq_contact'] || false;
  const isIntakeqAppointmentDiscovering = isDiscovering['intakeq_appointment'] || false;
  const isIntakeqFormDiscovering = isDiscovering['intakeq_form'] || false;
  const isAnyIntakeqDiscovering = isIntakeqContactDiscovering || isIntakeqAppointmentDiscovering || isIntakeqFormDiscovering;

  const handleDiscoverAllGhlFields = () => {
    onDiscoverFields('ghl', 'contact');
    onDiscoverFields('ghl', 'appointment');
    onDiscoverFields('ghl', 'form');
  };

  const handleDiscoverAllIntakeqFields = () => {
    onDiscoverFields('intakeq', 'contact');
    onDiscoverFields('intakeq', 'appointment');
    onDiscoverFields('intakeq', 'form');
  };

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4">
      <div className="flex flex-col gap-2">
        <div className="bg-muted/30 p-3 font-semibold text-center rounded-md">GoHighLevel Field</div>
        <Button
          variant={isAnyGhlDiscovering ? "secondary" : "outline"}
          size="sm"
          onClick={handleDiscoverAllGhlFields}
          disabled={isAnyGhlDiscovering}
          className="flex items-center gap-2 self-start"
          title="Discover available GoHighLevel fields"
        >
          <RefreshCw className={`h-4 w-4 ${isAnyGhlDiscovering ? 'animate-spin' : ''}`} />
          <span>{isAnyGhlDiscovering ? "Discovering..." : "Discover GHL Fields"}</span>
        </Button>
      </div>
      <div className="flex items-center justify-center font-medium">Sync Direction</div>
      <div className="flex flex-col gap-2 items-end">
        <div className="bg-muted/30 p-3 font-semibold text-center rounded-md w-full">IntakeQ Field</div>
        <Button
          variant={isAnyIntakeqDiscovering ? "secondary" : "outline"}
          size="sm"
          onClick={handleDiscoverAllIntakeqFields}
          disabled={isAnyIntakeqDiscovering}
          className="flex items-center gap-2"
          title="Discover available IntakeQ fields"
        >
          <RefreshCw className={`h-4 w-4 ${isAnyIntakeqDiscovering ? 'animate-spin' : ''}`} />
          <span>{isAnyIntakeqDiscovering ? "Discovering..." : "Discover IntakeQ Fields"}</span>
        </Button>
      </div>
    </div>
  );
};
