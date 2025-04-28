
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

export const useFieldDiscovery = () => {
  const { toast } = useToast();
  const [isDiscovering, setIsDiscovering] = useState<Record<string, boolean>>({});
  const [availableFields, setAvailableFields] = useState({
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

  const discoverFields = async (system: 'ghl' | 'intakeq', dataType: string): Promise<string[]> => {
    // Simulating API call to discover fields
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
      setIsDiscovering({ ...isDiscovering, [dataType]: true });
      
      // Discover fields for the selected system
      const newFields = await discoverFields(system, dataType);
      
      // Update available fields for ONLY the selected system, replacing previous values
      setAvailableFields(prev => ({
        ...prev,
        [system]: { 
          ...prev[system], 
          [dataType]: newFields // Replace with new fields instead of merging
        }
      }));

      toast({
        title: "Fields discovered",
        description: `${newFields.length} fields found for ${system} ${dataType}`,
      });
    } catch (error) {
      console.error(`Error discovering fields for ${dataType}:`, error);
      toast({
        title: "Error",
        description: `Failed to discover fields for ${dataType}`,
        variant: "destructive",
      });
    } finally {
      setIsDiscovering({ ...isDiscovering, [dataType]: false });
    }
  };

  return {
    isDiscovering,
    availableFields,
    handleDiscoverFields
  };
};
