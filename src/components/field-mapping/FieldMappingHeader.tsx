
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

  // Fix: Create specific discover buttons for each type instead of one button that discovers all
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4">
      <div className="flex flex-col gap-2">
        <div className="bg-muted/30 p-3 font-semibold text-center rounded-md">GoHighLevel Field</div>
        <div className="flex flex-col gap-2">
          <Button
            variant={isGhlContactDiscovering ? "secondary" : "outline"}
            size="sm"
            onClick={() => onDiscoverFields('ghl', 'contact')}
            disabled={isGhlContactDiscovering}
            className="flex items-center gap-2 self-start"
            title="Discover available GoHighLevel contact fields"
          >
            <RefreshCw className={`h-4 w-4 ${isGhlContactDiscovering ? 'animate-spin' : ''}`} />
            <span>{isGhlContactDiscovering ? "Discovering..." : "Discover Contact Fields"}</span>
          </Button>
          
          <Button
            variant={isGhlAppointmentDiscovering ? "secondary" : "outline"}
            size="sm"
            onClick={() => onDiscoverFields('ghl', 'appointment')}
            disabled={isGhlAppointmentDiscovering}
            className="flex items-center gap-2 self-start"
            title="Discover available GoHighLevel appointment fields"
          >
            <RefreshCw className={`h-4 w-4 ${isGhlAppointmentDiscovering ? 'animate-spin' : ''}`} />
            <span>{isGhlAppointmentDiscovering ? "Discovering..." : "Discover Appointment Fields"}</span>
          </Button>
          
          <Button
            variant={isGhlFormDiscovering ? "secondary" : "outline"}
            size="sm"
            onClick={() => onDiscoverFields('ghl', 'form')}
            disabled={isGhlFormDiscovering}
            className="flex items-center gap-2 self-start"
            title="Discover available GoHighLevel form fields"
          >
            <RefreshCw className={`h-4 w-4 ${isGhlFormDiscovering ? 'animate-spin' : ''}`} />
            <span>{isGhlFormDiscovering ? "Discovering..." : "Discover Form Fields"}</span>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-center font-medium">Sync Direction</div>
      <div className="flex flex-col gap-2 items-end">
        <div className="bg-muted/30 p-3 font-semibold text-center rounded-md w-full">IntakeQ Field</div>
        <div className="flex flex-col gap-2 items-end">
          <Button
            variant={isIntakeqContactDiscovering ? "secondary" : "outline"}
            size="sm"
            onClick={() => onDiscoverFields('intakeq', 'contact')}
            disabled={isIntakeqContactDiscovering}
            className="flex items-center gap-2"
            title="Discover available IntakeQ contact fields"
          >
            <RefreshCw className={`h-4 w-4 ${isIntakeqContactDiscovering ? 'animate-spin' : ''}`} />
            <span>{isIntakeqContactDiscovering ? "Discovering..." : "Discover Contact Fields"}</span>
          </Button>
          
          <Button
            variant={isIntakeqAppointmentDiscovering ? "secondary" : "outline"}
            size="sm"
            onClick={() => onDiscoverFields('intakeq', 'appointment')}
            disabled={isIntakeqAppointmentDiscovering}
            className="flex items-center gap-2"
            title="Discover available IntakeQ appointment fields"
          >
            <RefreshCw className={`h-4 w-4 ${isIntakeqAppointmentDiscovering ? 'animate-spin' : ''}`} />
            <span>{isIntakeqAppointmentDiscovering ? "Discovering..." : "Discover Appointment Fields"}</span>
          </Button>
          
          <Button
            variant={isIntakeqFormDiscovering ? "secondary" : "outline"}
            size="sm"
            onClick={() => onDiscoverFields('intakeq', 'form')}
            disabled={isIntakeqFormDiscovering}
            className="flex items-center gap-2"
            title="Discover available IntakeQ form fields"
          >
            <RefreshCw className={`h-4 w-4 ${isIntakeqFormDiscovering ? 'animate-spin' : ''}`} />
            <span>{isIntakeqFormDiscovering ? "Discovering..." : "Discover Form Fields"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
