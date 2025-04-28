
import React, { useState } from 'react';
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FieldControls } from './field-mapping/FieldControls';
import { CategoryHeader } from './field-mapping/CategoryHeader';
import type { FieldMappingProps, FieldMappingType } from '@/types/field-mapping';
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

export const FieldMapping = ({ fieldMapping, onChange, disabled = false }: FieldMappingProps) => {
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

  // Mock function to discover available fields
  const discoverFields = async (system: 'ghl' | 'intakeq', dataType: string): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip',
      'custom.preferredContactMethod', 'custom.leadSource', 'custom.insuranceProvider'
    ];
  };

  const handleDiscoverFields = async (dataType: string) => {
    try {
      setIsDiscovering({ ...isDiscovering, [dataType]: true });
      
      const [ghlFields, intakeqFields] = await Promise.all([
        discoverFields('ghl', dataType),
        discoverFields('intakeq', dataType)
      ]);

      setAvailableFields(prev => ({
        ...prev,
        ghl: { ...prev.ghl, [dataType]: ghlFields },
        intakeq: { ...prev.intakeq, [dataType]: intakeqFields }
      }));

      toast({
        title: "Fields discovered",
        description: `${ghlFields.length + intakeqFields.length} total fields found for ${dataType}`,
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

  const dataTypes = ['contact', 'appointment', 'form'];
  const dataTypeLabels: Record<string, string> = {
    contact: 'Contacts',
    appointment: 'Appointments',
    form: 'Forms'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Level Mapping</CardTitle>
        <CardDescription>Configure which fields to sync between GoHighLevel and IntakeQ</CardDescription>
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
