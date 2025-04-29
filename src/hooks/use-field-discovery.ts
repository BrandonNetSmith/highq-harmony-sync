
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

export const useFieldDiscovery = () => {
  const { toast } = useToast();
  const [isDiscovering, setIsDiscovering] = useState<Record<string, boolean>>({});
  const [discoveredFields, setDiscoveredFields] = useState<Record<string, boolean>>({
    ghl_contact: false,
    intakeq_contact: false
  });
  const [availableFields, setAvailableFields] = useState({
    ghl: {
      contact: [] as string[],
      appointment: [] as string[],
      form: [] as string[]
    },
    intakeq: {
      contact: [] as string[],
      appointment: [] as string[],
      form: [] as string[]
    }
  });

  const discoverFields = async (system: 'ghl' | 'intakeq', dataType: string): Promise<string[]> => {
    // Simulating API call to discover fields
    console.log(`Discovering fields for ${system} ${dataType}`);
    
    // Ensure a consistent delay to avoid UI flashing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (system === 'ghl') {
      switch(dataType) {
        case 'contact':
          return [
            'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip',
            'custom.preferredContactMethod', 'custom.leadSource', 'custom.insuranceProvider',
            'dateOfBirth', 'companyName', 'tags', 'source', 'assignedTo', 'notes'
          ];
        case 'appointment':
          return [
            'startTime', 'endTime', 'title', 'description', 'location', 'status',
            'notes', 'reminders', 'assignedTo', 'custom.appointmentType', 'custom.preAppointmentNotes'
          ];
        case 'form':
          return [
            'formName', 'createdDate', 'status', 'isActive', 'fields',
            'custom.formCategory', 'custom.displayOrder', 'custom.requiredFields'
          ];
        default:
          return [];
      }
    } else {
      switch(dataType) {
        case 'contact':
          return [
            'firstName', 'lastName', 'email', 'phoneNumber', 'address', 'city', 'state', 'zipCode',
            'dateOfBirth', 'gender', 'emergencyContact', 'insuranceInfo', 'clientNotes',
            'custom.firstVisitDate', 'custom.patientID', 'custom.referralSource'
          ];
        case 'appointment':
          return [
            'appointmentDate', 'startTime', 'endTime', 'appointmentType', 'practitioner',
            'location', 'roomNumber', 'status', 'notes', 'custom.followUpRequired',
            'custom.appointmentPurpose', 'custom.visitNumber'
          ];
        case 'form':
          return [
            'formTitle', 'createdAt', 'updatedAt', 'status', 'formFields',
            'isTemplate', 'custom.formCategory', 'custom.displayOrder', 'custom.requiredSignature'
          ];
        default:
          return [];
      }
    }
  };

  const handleDiscoverFields = async (system: 'ghl' | 'intakeq', dataType: string): Promise<void> => {
    try {
      console.log(`Starting discovery for ${system} ${dataType}`);
      
      // Mark the specific dataType as discovering
      setIsDiscovering(prev => ({ 
        ...prev, 
        [`${system}_${dataType}`]: true
      }));
      
      // Discover fields for the selected system and dataType
      const newFields = await discoverFields(system, dataType);
      console.log(`Discovery completed for ${system} ${dataType}:`, newFields);
      
      // Filter out any empty values
      const filteredFields = newFields.filter(field => !!field);
      
      // Only update the fields for the specific system
      setAvailableFields(prev => {
        const updated = { ...prev };
        updated[system] = {
          ...updated[system],
          [dataType]: filteredFields
        };
        return updated;
      });

      // Mark this system and dataType as having been discovered
      setDiscoveredFields(prev => ({
        ...prev,
        [`${system}_${dataType}`]: true
      }));

      toast({
        title: "Fields discovered",
        description: `${filteredFields.length} fields found for ${system} ${dataType}`,
      });
    } catch (error) {
      console.error(`Error discovering fields for ${system} ${dataType}:`, error);
      toast({
        title: "Error",
        description: `Failed to discover fields for ${system} ${dataType}`,
        variant: "destructive",
      });
    } finally {
      // Clear the discovering state
      setIsDiscovering(prev => ({ 
        ...prev, 
        [`${system}_${dataType}`]: false
      }));
    }
  };

  return {
    isDiscovering,
    availableFields,
    discoveredFields,
    handleDiscoverFields
  };
};
