
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowDown, ArrowUp, ArrowLeftRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
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

  // Data types to display in the mapping UI
  const dataTypes = ['contact', 'appointment', 'form'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Level Mapping</CardTitle>
        <CardDescription>Configure which fields to sync between GoHighLevel and IntakeQ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="multiple" className="w-full">
          {dataTypes.map(dataType => (
            <AccordionItem key={dataType} value={dataType} className="border rounded-md mb-4 overflow-hidden">
              <AccordionTrigger className="px-4 py-2 bg-muted/30 hover:bg-muted/50">
                <h3 className="text-lg font-medium capitalize">{dataType} Fields</h3>
              </AccordionTrigger>
              <AccordionContent className="p-4">
                <div className="space-y-6">
                  {fieldMapping[dataType] && Object.entries(fieldMapping[dataType].fields).map(([fieldName, fieldSettings]) => (
                    <Collapsible key={fieldName} className="border rounded-lg">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full flex items-center justify-between p-4 text-left" disabled={disabled}>
                          <div className="flex items-center">
                            <div className="mr-4">
                              <Switch
                                id={`${dataType}-${fieldName}-sync`}
                                checked={fieldSettings.sync}
                                onCheckedChange={(checked) => handleFieldSyncChange(dataType, fieldName, checked)}
                                disabled={disabled}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${dataType}-${fieldName}-sync`} className="font-medium capitalize">
                                {fieldName.replace(/_/g, ' ')}
                              </Label>
                              <div className="text-sm text-muted-foreground">
                                {fieldSettings.sync ? (
                                  <>
                                    {fieldSettings.direction === "bidirectional" && <span className="flex items-center"><ArrowLeftRight className="h-3 w-3 mr-1"/> Bidirectional</span>}
                                    {fieldSettings.direction === "one_way_ghl_to_intakeq" && <span className="flex items-center"><ArrowDown className="h-3 w-3 mr-1"/> GHL to IntakeQ</span>}
                                    {fieldSettings.direction === "one_way_intakeq_to_ghl" && <span className="flex items-center"><ArrowUp className="h-3 w-3 mr-1"/> IntakeQ to GHL</span>}
                                  </>
                                ) : (
                                  "Not synced"
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {fieldSettings.sync ? "Details" : ""}
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      {fieldSettings.sync && (
                        <CollapsibleContent className="p-4 border-t space-y-4 bg-muted/10">
                          <div>
                            <Label className="mb-2 block">Field Mapping</Label>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="bg-muted/20 p-2 rounded">
                                <div className="font-medium mb-1">GoHighLevel Field</div>
                                <div className="text-muted-foreground">{fieldSettings.ghlField || fieldName}</div>
                              </div>
                              <div className="bg-muted/20 p-2 rounded">
                                <div className="font-medium mb-1">IntakeQ Field</div>
                                <div className="text-muted-foreground">{fieldSettings.intakeqField || fieldName}</div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="mb-2 block">Sync Direction</Label>
                            <ToggleGroup 
                              type="single" 
                              variant="outline"
                              className="justify-start"
                              value={fieldSettings.direction}
                              onValueChange={(value) => {
                                if (value) handleFieldDirectionChange(dataType, fieldName, value as SyncDirection);
                              }}
                              disabled={disabled || !fieldSettings.sync}
                            >
                              <ToggleGroupItem value="bidirectional" className="flex items-center gap-1 text-xs">
                                <ArrowLeftRight className="h-3 w-3" />
                                <span>Bidirectional</span>
                              </ToggleGroupItem>
                              <ToggleGroupItem value="one_way_ghl_to_intakeq" className="flex items-center gap-1 text-xs">
                                <ArrowDown className="h-3 w-3" />
                                <span>GHL → IntakeQ</span>
                              </ToggleGroupItem>
                              <ToggleGroupItem value="one_way_intakeq_to_ghl" className="flex items-center gap-1 text-xs">
                                <ArrowUp className="h-3 w-3" />
                                <span>IntakeQ → GHL</span>
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
