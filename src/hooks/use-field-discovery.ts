
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

  // Mock function to discover available fields with more comprehensive fields
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

  const handleDiscoverFields = async (dataType: string, fieldMapping: FieldMappingType): Promise<FieldMappingType> => {
    try {
      setIsDiscovering({ ...isDiscovering, [dataType]: true });
      
      const [ghlFields, intakeqFields] = await Promise.all([
        discoverFields('ghl', dataType),
        discoverFields('intakeq', dataType)
      ]);

      // Get existing fields
      const existingGhlFields = new Set(availableFields.ghl[dataType] || []);
      const existingIntakeqFields = new Set(availableFields.intakeq[dataType] || []);
      
      // Filter out duplicates when adding new fields
      const uniqueGhlFields = ghlFields.filter(field => !existingGhlFields.has(field));
      const uniqueIntakeqFields = intakeqFields.filter(field => !existingIntakeqFields.has(field));

      // Update available fields with unique values only
      setAvailableFields(prev => ({
        ...prev,
        ghl: { 
          ...prev.ghl, 
          [dataType]: [...Array.from(new Set([...prev.ghl[dataType], ...uniqueGhlFields]))]
        },
        intakeq: { 
          ...prev.intakeq, 
          [dataType]: [...Array.from(new Set([...prev.intakeq[dataType], ...uniqueIntakeqFields]))]
        }
      }));

      // Create new field mapping entries for discovered fields
      const newMapping = { ...fieldMapping };
      
      const addNewFieldIfNotExists = (fieldName: string) => {
        if (!newMapping[dataType].fields[fieldName]) {
          newMapping[dataType].fields[fieldName] = {
            sync: true,
            direction: 'bidirectional' as SyncDirection
          };
        }
      };
      
      uniqueGhlFields.forEach(addNewFieldIfNotExists);
      uniqueIntakeqFields.forEach(addNewFieldIfNotExists);

      toast({
        title: "Fields discovered",
        description: `${uniqueGhlFields.length + uniqueIntakeqFields.length} new unique fields found for ${dataType}`,
      });

      return newMapping;
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
