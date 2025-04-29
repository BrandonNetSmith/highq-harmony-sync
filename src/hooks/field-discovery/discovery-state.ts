
import { useState } from 'react';
import type { AvailableFields } from './types';

/**
 * Custom hook for managing field discovery state
 */
export const useDiscoveryState = () => {
  const [isDiscovering, setIsDiscovering] = useState<Record<string, boolean>>({});
  const [discoveredFields, setDiscoveredFields] = useState<Record<string, boolean>>({
    ghl_contact: false,
    ghl_appointment: false,
    ghl_form: false,
    intakeq_contact: false,
    intakeq_appointment: false,
    intakeq_form: false
  });
  const [availableFields, setAvailableFields] = useState<AvailableFields>({
    ghl: {
      contact: [],
      appointment: [],
      form: []
    },
    intakeq: {
      contact: [],
      appointment: [],
      form: []
    }
  });

  return {
    isDiscovering,
    setIsDiscovering,
    discoveredFields,
    setDiscoveredFields,
    availableFields,
    setAvailableFields
  };
};
