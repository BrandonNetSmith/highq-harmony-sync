
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
        {/* Column Headers - Always visible */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4">
          <div className="bg-muted/30 p-3 font-semibold text-center rounded-md">GoHighLevel</div>
          <div className="flex items-center justify-center font-medium">Sync Direction</div>
          <div className="bg-muted/30 p-3 font-semibold text-center rounded-md">IntakeQ</div>
        </div>

        <Accordion type="multiple" className="w-full">
          {dataTypes.map(dataType => {
            const categoryDirection = getCategoryDirection(dataType);
            
            return (
              <AccordionItem key={dataType} value={dataType} className="border rounded-md mb-4">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center bg-muted/30 p-4">
                    <AccordionTrigger className="flex-1 hover:no-underline">
                      <h3 className="text-lg font-medium capitalize text-left">{dataTypeLabels[dataType] || dataType}</h3>
                    </AccordionTrigger>
                    <div className="flex items-center mr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex gap-2 items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryDirectionChange(dataType);
                        }}
                        disabled={disabled}
                      >
                        {categoryDirection && getDirectionIcon(categoryDirection)}
                        <span className="text-xs">{categoryDirection && getDirectionText(categoryDirection)}</span>
                      </Button>
                    </div>
                  </div>
                
                  <AccordionContent className="p-4">
                    <div className="space-y-4">
                      {/* Field rows */}
                      {fieldMapping[dataType] && Object.entries(fieldMapping[dataType].fields).map(([fieldName, fieldSettings]) => (
                        <Collapsible key={fieldName} className="border rounded-lg">
                          <CollapsibleTrigger asChild>
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-4 hover:bg-muted/10 transition-colors cursor-pointer">
                              {/* GHL Side */}
                              <div className="text-left p-4 bg-background rounded-l-lg border-r">
                                <span className="font-medium capitalize">
                                  {fieldSettings.ghlField || fieldName.replace(/_/g, ' ')}
                                </span>
                              </div>
                              
                              {/* Sync Controls */}
                              <div className="flex flex-col items-center justify-center py-2 gap-2">
                                <Switch
                                  id={`${dataType}-${fieldName}-sync`}
                                  checked={fieldSettings.sync}
                                  onCheckedChange={(checked) => handleFieldSyncChange(dataType, fieldName, checked)}
                                  disabled={disabled}
                                />
                                
                                {fieldSettings.sync && (
                                  <ToggleGroup
                                    type="single"
                                    size="sm"
                                    value={fieldSettings.direction}
                                    onValueChange={(value) => {
                                      if (value) handleFieldDirectionChange(dataType, fieldName, value as SyncDirection);
                                    }}
                                    className="flex gap-0 border rounded-md overflow-hidden"
                                    disabled={disabled || !fieldSettings.sync}
                                  >
                                    <ToggleGroupItem 
                                      value="one_way_intakeq_to_ghl"
                                      aria-label="IntakeQ to GHL"
                                      className="px-2 rounded-none border-r data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                    >
                                      <ArrowLeft className="h-4 w-4" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem 
                                      value="bidirectional"
                                      aria-label="Bidirectional"
                                      className="px-2 rounded-none border-r data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                    >
                                      <ArrowLeftRight className="h-4 w-4" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem 
                                      value="one_way_ghl_to_intakeq"
                                      aria-label="GHL to IntakeQ"
                                      className="px-2 rounded-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                    >
                                      <ArrowRight className="h-4 w-4" />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              </div>
                              
                              {/* IntakeQ Side */}
                              <div className="text-right p-4 bg-background rounded-r-lg border-l">
                                <span className="font-medium capitalize">
                                  {fieldSettings.intakeqField || fieldName.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>
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
                                    <ToggleGroup
                                      type="single"
                                      size="sm"
                                      value={fieldSettings.direction}
                                      onValueChange={(value) => {
                                        if (value) handleFieldDirectionChange(dataType, fieldName, value as SyncDirection);
                                      }}
                                      className="flex flex-col gap-2 w-full"
                                      disabled={disabled}
                                    >
                                      <ToggleGroupItem 
                                        value="bidirectional"
                                        aria-label="Bidirectional"
                                        className="w-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                      >
                                        <div className="flex items-center gap-2">
                                          <ArrowLeftRight className="h-4 w-4" />
                                          <span>Both</span>
                                        </div>
                                      </ToggleGroupItem>
                                      <ToggleGroupItem 
                                        value="one_way_ghl_to_intakeq"
                                        aria-label="GHL to IntakeQ"
                                        className="w-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                      >
                                        <div className="flex items-center gap-2">
                                          <ArrowRight className="h-4 w-4" />
                                          <span>GHL to IQ</span>
                                        </div>
                                      </ToggleGroupItem>
                                      <ToggleGroupItem 
                                        value="one_way_intakeq_to_ghl"
                                        aria-label="IntakeQ to GHL"
                                        className="w-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                      >
                                        <div className="flex items-center gap-2">
                                          <ArrowLeft className="h-4 w-4" />
                                          <span>IQ to GHL</span>
                                        </div>
                                      </ToggleGroupItem>
                                    </ToggleGroup>
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
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};
