
/**
 * Types for field discovery functionality
 */

export interface AvailableFields {
  ghl: {
    contact: string[];
    appointment: string[];
    form: string[];
  };
  intakeq: {
    contact: string[];
    appointment: string[];
    form: string[];
  };
}

export interface DiscoveryState {
  isDiscovering: Record<string, boolean>;
  discoveredFields: Record<string, boolean>;
  availableFields: AvailableFields;
}

export type DiscoverySystem = 'ghl' | 'intakeq';
export type DataType = 'contact' | 'appointment' | 'form';
