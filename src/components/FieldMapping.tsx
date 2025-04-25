
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];
type FieldMappingType = {
  [dataType: string]: {
    fields: {
      [fieldName: string]: {
        sync: boolean;
        direction: SyncDirection;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Level Mapping</CardTitle>
        <CardDescription>Configure which fields to sync and in what direction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="multiple" className="w-full">
          {Object.entries(fieldMapping).map(([dataType, config]) => (
            <AccordionItem key={dataType} value={dataType}>
              <AccordionTrigger className="text-lg font-medium capitalize">
                {dataType} Data
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-4">
                  {Object.entries(config.fields).map(([field, settings]) => (
                    <div key={field} className="flex flex-col space-y-2 pb-4 border-b">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${dataType}-${field}-sync`} className="font-medium capitalize">
                          {field.replace(/_/g, ' ')}
                        </Label>
                        <Switch
                          id={`${dataType}-${field}-sync`}
                          checked={settings.sync}
                          onCheckedChange={(checked) => handleFieldSyncChange(dataType, field, checked)}
                          disabled={disabled}
                        />
                      </div>
                      
                      {settings.sync && (
                        <div className="pl-4">
                          <Label className="text-sm text-muted-foreground mb-1 block">Sync Direction:</Label>
                          <RadioGroup
                            value={settings.direction}
                            onValueChange={(value) => handleFieldDirectionChange(dataType, field, value as SyncDirection)}
                            disabled={disabled}
                            className="pl-4"
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <RadioGroupItem value="bidirectional" id={`${dataType}-${field}-bidirectional`} />
                              <Label htmlFor={`${dataType}-${field}-bidirectional`} className="flex items-center">
                                <ArrowDown className="mr-1 h-3 w-3" />
                                <ArrowUp className="mr-1 h-3 w-3" />
                                Bidirectional
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 mb-1">
                              <RadioGroupItem value="one_way_ghl_to_intakeq" id={`${dataType}-${field}-ghl-to-intakeq`} />
                              <Label htmlFor={`${dataType}-${field}-ghl-to-intakeq`}>
                                <ArrowDown className="mr-1 h-3 w-3" />
                                GoHighLevel → IntakeQ
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="one_way_intakeq_to_ghl" id={`${dataType}-${field}-intakeq-to-ghl`} />
                              <Label htmlFor={`${dataType}-${field}-intakeq-to-ghl`}>
                                <ArrowUp className="mr-1 h-3 w-3" />
                                IntakeQ → GoHighLevel
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </div>
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
