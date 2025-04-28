
import React, { useState } from 'react';
import { RefreshCw, PlayCircle, PauseCircle, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FieldControls } from './field-mapping/FieldControls';
import { CategoryHeader } from './field-mapping/CategoryHeader';
import type { FieldMappingProps, FieldMappingType } from '@/types/field-mapping';
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

export const FieldMapping = ({ fieldMapping, onChange, disabled = false }: FieldMappingProps) => {
  const { toast } = useToast();
  const [isDiscovering, setIsDiscovering] = useState<Record<string, boolean>>({});
  const [isSyncingNow, setSyncingNow] = useState(false);
  const [isAutoSyncEnabled, setAutoSyncEnabled] = useState(false);
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
    
    // Extended field lists based on the system and data type
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

  const handleDiscoverFields = async (dataType: string) => {
    try {
      setIsDiscovering({ ...isDiscovering, [dataType]: true });
      
      const [ghlFields, intakeqFields] = await Promise.all([
        discoverFields('ghl', dataType),
        discoverFields('intakeq', dataType)
      ]);

      // Create a Set of existing fields to avoid duplicates
      const existingGhlFields = new Set(availableFields.ghl[dataType]);
      const existingIntakeqFields = new Set(availableFields.intakeq[dataType]);
      
      // Add new fields without duplicates
      const uniqueGhlFields = [...new Set([...ghlFields.filter(field => !existingGhlFields.has(field))])];
      const uniqueIntakeqFields = [...new Set([...intakeqFields.filter(field => !existingIntakeqFields.has(field))])];

      setAvailableFields(prev => ({
        ...prev,
        ghl: { 
          ...prev.ghl, 
          [dataType]: [...prev.ghl[dataType], ...uniqueGhlFields]
        },
        intakeq: { 
          ...prev.intakeq, 
          [dataType]: [...prev.intakeq[dataType], ...uniqueIntakeqFields]
        }
      }));

      // Create new field mapping entries for discovered fields
      const newMapping = { ...fieldMapping };
      
      // Helper function to add new field if it doesn't exist
      const addNewFieldIfNotExists = (fieldName: string) => {
        if (!newMapping[dataType].fields[fieldName]) {
          newMapping[dataType].fields[fieldName] = {
            sync: true,
            direction: 'bidirectional'
          };
        }
      };
      
      // Add any newly discovered fields to the mapping
      uniqueGhlFields.forEach(addNewFieldIfNotExists);
      uniqueIntakeqFields.forEach(addNewFieldIfNotExists);
      
      // Update the field mapping with new entries
      onChange(newMapping);

      toast({
        title: "Fields discovered",
        description: `${uniqueGhlFields.length + uniqueIntakeqFields.length} new fields found for ${dataType}`,
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

  const handleFieldChange = (
    dataType: string,
    fieldName: string,
    updates: Partial<{
      sync: boolean;
      direction: SyncDirection;
      ghlField: string;
      intakeqField: string;
    }>
  ) => {
    const newMapping = { ...fieldMapping };
    newMapping[dataType].fields[fieldName] = {
      ...newMapping[dataType].fields[fieldName],
      ...updates
    };
    onChange(newMapping);
  };

  const handleCategorySyncChange = (dataType: string, checked: boolean) => {
    const newMapping = { ...fieldMapping };
    Object.keys(newMapping[dataType].fields).forEach(fieldName => {
      newMapping[dataType].fields[fieldName].sync = checked;
    });
    onChange(newMapping);
  };

  const handleCategoryDirectionChange = (dataType: string, direction: SyncDirection) => {
    const newMapping = { ...fieldMapping };
    Object.keys(newMapping[dataType].fields).forEach(fieldName => {
      if (newMapping[dataType].fields[fieldName].sync) {
        newMapping[dataType].fields[fieldName].direction = direction;
      }
    });
    onChange(newMapping);
  };

  const getCategoryDirection = (dataType: string): SyncDirection | null => {
    const fields = Object.values(fieldMapping[dataType].fields)
      .filter(field => field.sync);
    if (fields.length === 0) return null;
    const firstDirection = fields[0].direction;
    return fields.every(field => field.direction === firstDirection) ? firstDirection : null;
  };

  const getCategorySyncStatus = (dataType: string): boolean => {
    const fields = Object.values(fieldMapping[dataType].fields);
    return fields.some(field => field.sync);
  };

  const handleSyncNow = async () => {
    setSyncingNow(true);
    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Sync Complete",
        description: "Manual synchronization was completed successfully",
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync Error",
        description: "Failed to complete synchronization",
        variant: "destructive",
      });
    } finally {
      setSyncingNow(false);
    }
  };

  const handleToggleAutoSync = () => {
    const newAutoSyncState = !isAutoSyncEnabled;
    setAutoSyncEnabled(newAutoSyncState);
    toast({
      title: newAutoSyncState ? "Auto-Sync Enabled" : "Auto-Sync Disabled",
      description: newAutoSyncState 
        ? "Changes will now be automatically synchronized" 
        : "Automatic synchronization has been paused",
    });
  };

  const dataTypes = ['contact', 'appointment', 'form'];
  const dataTypeLabels: Record<string, string> = {
    contact: 'Contacts',
    appointment: 'Appointments',
    form: 'Forms'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Field Level Mapping</CardTitle>
          <CardDescription>Configure which fields to sync between GoHighLevel and IntakeQ</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={isAutoSyncEnabled}
              onCheckedChange={handleToggleAutoSync}
              disabled={disabled}
            />
            <span className="text-sm font-medium">
              {isAutoSyncEnabled ? "Auto-Sync On" : "Auto-Sync Off"}
            </span>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleSyncNow}
            disabled={disabled || isSyncingNow}
            className="flex items-center gap-2"
          >
            <ArrowRightLeft className={`h-4 w-4 ${isSyncingNow ? 'animate-spin' : ''}`} />
            {isSyncingNow ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Column Headers */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4">
          <div className="bg-muted/30 p-3 font-semibold text-center rounded-md">GoHighLevel</div>
          <div className="flex items-center justify-center font-medium">Sync Direction</div>
          <div className="bg-muted/30 p-3 font-semibold text-center rounded-md">IntakeQ</div>
        </div>

        <Accordion type="multiple" className="w-full">
          {dataTypes.map(dataType => (
            <AccordionItem key={dataType} value={dataType} className="border rounded-md mb-4">
              <div className="flex flex-col">
                <CategoryHeader
                  dataType={dataType}
                  label={dataTypeLabels[dataType] || dataType}
                  isCategoryEnabled={getCategorySyncStatus(dataType)}
                  categoryDirection={getCategoryDirection(dataType)}
                  disabled={disabled}
                  onCategorySyncChange={(checked) => handleCategorySyncChange(dataType, checked)}
                  onCategoryDirectionChange={(direction) => handleCategoryDirectionChange(dataType, direction)}
                />
              
                <AccordionContent className="p-4">
                  <div className="space-y-4">
                    {/* Discover Fields Button */}
                    <div className="flex justify-end mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDiscoverFields(dataType)}
                        disabled={disabled || isDiscovering[dataType]}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${isDiscovering[dataType] ? 'animate-spin' : ''}`} />
                        Discover Available Fields
                      </Button>
                    </div>
                    
                    {/* Field rows */}
                    {fieldMapping[dataType] && Object.entries(fieldMapping[dataType].fields).map(([fieldName, fieldSettings]) => (
                      <div key={fieldName} className="border rounded-lg">
                        <FieldControls
                          dataType={dataType}
                          fieldName={fieldName}
                          fieldSettings={fieldSettings}
                          availableFields={availableFields}
                          disabled={disabled}
                          onFieldChange={handleFieldChange}
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
