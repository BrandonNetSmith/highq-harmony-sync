import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { FieldMappingType } from '@/types/field-mapping';
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

  const handleDiscoverFields = async (system: 'ghl' | 'intakeq', dataType: string): Promise<FieldMappingType> => {
    try {
      setIsDiscovering({ ...isDiscovering, [dataType]: true });
      
      // Only discover fields for the selected system
      const newFields = await discoverFields(system, dataType);
      
      // Get existing fields for the selected system
      const existingFields = new Set(availableFields[system][dataType] || []);
      
      // Filter out duplicates
      const uniqueFields = newFields.filter(field => !existingFields.has(field));

      // Update available fields for only the selected system
      setAvailableFields(prev => ({
        ...prev,
        [system]: { 
          ...prev[system], 
          [dataType]: [...Array.from(new Set([...prev[system][dataType], ...uniqueFields]))]
        }
      }));

      toast({
        title: "Fields discovered",
        description: `${uniqueFields.length} new unique fields found for ${system} ${dataType}`,
      });

      return fieldMapping;
    } catch (error) {
      console.error(`Error discovering fields for ${dataType}:`, error);
      toast({
        title: "Error",
        description: `Failed to discover fields for ${dataType}`,
        variant: "destructive",
      });
      return fieldMapping;
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
