
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, ArrowRight, ArrowLeftRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

// Define the FieldMappingType to represent our field mapping structure
type FieldMappingType = {
  [dataType: string]: {
    fields: {
      [fieldName: string]: {
        sync: boolean;
        direction: SyncDirection;
        ghlField?: string;
        intakeqField?: string;
      }
    }
  }
}

interface FieldMappingProps {
  fieldMapping: FieldMappingType;
  onChange: (fieldMapping: FieldMappingType) => void;
  disabled?: boolean;
}

export const FieldMapping = ({ fieldMapping, onChange, disabled = false }: FieldMappingProps) => {
  const handleFieldSyncChange = (dataType: string, field: string, checked: boolean) => {
    const newMapping = { ...fieldMapping };
    newMapping[dataType].fields[field].sync = checked;
    onChange(newMapping);
  };

  const handleFieldDirectionChange = (dataType: string, field: string, direction: SyncDirection) => {
    const newMapping = { ...fieldMapping };
    newMapping[dataType].fields[field].direction = direction;
    onChange(newMapping);
  };

  const handleCategoryDirectionChange = (dataType: string) => {
    const newMapping = { ...fieldMapping };
    const fields = Object.keys(newMapping[dataType].fields);
    
    // Get current direction of first field to determine next direction
    const currentDirection = fields.length > 0 
      ? newMapping[dataType].fields[fields[0]].direction 
      : 'bidirectional';
    
    let newDirection: SyncDirection;
    
    // Cycle through directions: bidirectional -> ghl_to_intakeq -> intakeq_to_ghl -> bidirectional
    switch (currentDirection) {
      case 'bidirectional':
        newDirection = 'one_way_ghl_to_intakeq';
        break;
      case 'one_way_ghl_to_intakeq':
        newDirection = 'one_way_intakeq_to_ghl';
        break;
      case 'one_way_intakeq_to_ghl':
      default:
        newDirection = 'bidirectional';
        break;
    }
    
    // Apply the new direction to all fields in this category
    fields.forEach(fieldName => {
      if (newMapping[dataType].fields[fieldName].sync) {
        newMapping[dataType].fields[fieldName].direction = newDirection;
      }
    });
    
    onChange(newMapping);
  };

  const getCategoryDirection = (dataType: string): SyncDirection | null => {
    const fields = Object.values(fieldMapping[dataType].fields)
      .filter(field => field.sync);
    
    if (fields.length === 0) return null;
    
    // If all fields have the same direction, return that direction
    const firstDirection = fields[0].direction;
    return fields.every(field => field.direction === firstDirection) ? firstDirection : null;
  };

  const getDirectionIcon = (direction: SyncDirection) => {
    switch (direction) {
      case 'bidirectional':
        return <ArrowLeftRight className="h-5 w-5" />;
      case 'one_way_ghl_to_intakeq':
        return <ArrowRight className="h-5 w-5" />;
      case 'one_way_intakeq_to_ghl':
        return <ArrowLeft className="h-5 w-5" />;
    }
  };

  const getDirectionText = (direction: SyncDirection) => {
    switch (direction) {
      case 'bidirectional':
        return "Bidirectional";
      case 'one_way_ghl_to_intakeq':
        return "GHL to IntakeQ";
      case 'one_way_intakeq_to_ghl':
        return "IntakeQ to GHL";
    }
  };

  // Data types to display in the mapping UI
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
        <Accordion type="multiple" className="w-full">
          {dataTypes.map(dataType => {
            const categoryDirection = getCategoryDirection(dataType);
            
            return (
              <AccordionItem key={dataType} value={dataType} className="border rounded-md mb-4">
                <div className="flex items-center">
                  <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 flex-1">
                    <div className="flex items-center justify-between w-full pr-4">
                      <h3 className="text-lg font-medium capitalize">{dataTypeLabels[dataType] || dataType}</h3>
                      {categoryDirection && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          {getDirectionIcon(categoryDirection)}
                          <span className="ml-1 hidden md:inline">{getDirectionText(categoryDirection)}</span>
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryDirectionChange(dataType);
                    }}
                    disabled={disabled}
                  >
                    {categoryDirection ? getDirectionIcon(categoryDirection) : <ArrowLeftRight className="h-5 w-5" />}
                    <span className="sr-only">Change sync direction</span>
                  </Button>
                </div>
                <AccordionContent className="p-4">
                  <div className="space-y-6">
                    {/* Header row with column names */}
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
                      <div className="font-medium text-center p-2 bg-muted/30 rounded-md">GoHighLevel</div>
                      <div className="font-medium text-center">Sync</div>
                      <div className="font-medium text-center p-2 bg-muted/30 rounded-md">IntakeQ</div>
                    </div>
                    
                    {/* Field rows */}
                    {fieldMapping[dataType] && Object.entries(fieldMapping[dataType].fields).map(([fieldName, fieldSettings]) => (
                      <Collapsible key={fieldName} className="border rounded-lg">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full flex items-center justify-between p-4 text-left" disabled={disabled}>
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-4">
                              {/* GHL Side */}
                              <div className="text-left font-medium capitalize p-2 bg-background rounded">
                                {fieldSettings.ghlField || fieldName.replace(/_/g, ' ')}
                              </div>
                              
                              {/* Sync Controls */}
                              <div className="flex flex-col items-center justify-center">
                                <Switch
                                  id={`${dataType}-${fieldName}-sync`}
                                  checked={fieldSettings.sync}
                                  onCheckedChange={(checked) => handleFieldSyncChange(dataType, fieldName, checked)}
                                  disabled={disabled}
                                  className="mb-1"
                                />
                                
                                {fieldSettings.sync && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      let newDirection: SyncDirection;
                                      switch (fieldSettings.direction) {
                                        case 'bidirectional':
                                          newDirection = 'one_way_ghl_to_intakeq';
                                          break;
                                        case 'one_way_ghl_to_intakeq':
                                          newDirection = 'one_way_intakeq_to_ghl';
                                          break;
                                        case 'one_way_intakeq_to_ghl':
                                        default:
                                          newDirection = 'bidirectional';
                                          break;
                                      }
                                      handleFieldDirectionChange(dataType, fieldName, newDirection);
                                    }}
                                    disabled={disabled || !fieldSettings.sync}
                                  >
                                    {getDirectionIcon(fieldSettings.direction)}
                                  </Button>
                                )}
                              </div>
                              
                              {/* IntakeQ Side */}
                              <div className="text-right font-medium capitalize p-2 bg-background rounded">
                                {fieldSettings.intakeqField || fieldName.replace(/_/g, ' ')}
                              </div>
                            </div>
                          </Button>
                        </CollapsibleTrigger>
                        
                        {fieldSettings.sync && (
                          <CollapsibleContent className="p-4 border-t bg-muted/10">
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
                              {/* GHL Field Details */}
                              <div>
                                <Label className="mb-2 block">GoHighLevel Field</Label>
                                <div className="bg-background p-3 rounded border">
                                  <div>{fieldSettings.ghlField || fieldName}</div>
                                </div>
                              </div>
                              
                              {/* Direction Controls */}
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <Label className="mb-1 block text-center">Direction</Label>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant={fieldSettings.direction === 'bidirectional' ? 'default' : 'outline'}
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleFieldDirectionChange(dataType, fieldName, 'bidirectional')}
                                    disabled={disabled}
                                  >
                                    <ArrowLeftRight className="h-4 w-4 mr-1" />
                                    <span>Both</span>
                                  </Button>
                                  <Button
                                    variant={fieldSettings.direction === 'one_way_ghl_to_intakeq' ? 'default' : 'outline'}
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleFieldDirectionChange(dataType, fieldName, 'one_way_ghl_to_intakeq')}
                                    disabled={disabled}
                                  >
                                    <ArrowRight className="h-4 w-4 mr-1" />
                                    <span>GHL to IQ</span>
                                  </Button>
                                  <Button
                                    variant={fieldSettings.direction === 'one_way_intakeq_to_ghl' ? 'default' : 'outline'}
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleFieldDirectionChange(dataType, fieldName, 'one_way_intakeq_to_ghl')}
                                    disabled={disabled}
                                  >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    <span>IQ to GHL</span>
                                  </Button>
                                </div>
                              </div>
                              
                              {/* IntakeQ Field Details */}
                              <div>
                                <Label className="mb-2 block">IntakeQ Field</Label>
                                <div className="bg-background p-3 rounded border">
                                  <div>{fieldSettings.intakeqField || fieldName}</div>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};
