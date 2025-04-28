
import React from 'react';
import { ArrowLeft, ArrowRight, ArrowLeftRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { FieldControlsProps } from "@/types/field-mapping";

export const FieldControls = ({
  dataType,
  fieldName,
  fieldSettings,
  availableFields,
  disabled,
  onFieldChange,
}: FieldControlsProps) => {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-4 hover:bg-muted/10 transition-colors">
      {/* GHL Side */}
      <div className="text-left p-4 bg-background rounded-l-lg">
        <Select
          value={fieldSettings.ghlField || fieldName}
          onValueChange={(value) => {
            onFieldChange(dataType, fieldName, { ghlField: value });
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select GHL field" />
          </SelectTrigger>
          <SelectContent>
            {availableFields.ghl[dataType]?.map((field: string) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sync Controls */}
      <div className="flex flex-col items-center justify-center py-2 gap-2">
        <Switch
          id={`${dataType}-${fieldName}-sync`}
          checked={fieldSettings.sync}
          onCheckedChange={(checked) => {
            onFieldChange(dataType, fieldName, { sync: checked });
          }}
          disabled={disabled}
        />
        
        {fieldSettings.sync && (
          <ToggleGroup
            type="single"
            size="sm"
            value={fieldSettings.direction}
            onValueChange={(value: any) => {
              if (value) onFieldChange(dataType, fieldName, { direction: value });
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
      <div className="text-right p-4 bg-background rounded-r-lg">
        <Select
          value={fieldSettings.intakeqField || fieldName}
          onValueChange={(value) => {
            onFieldChange(dataType, fieldName, { intakeqField: value });
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select IntakeQ field" />
          </SelectTrigger>
          <SelectContent>
            {availableFields.intakeq[dataType]?.map((field: string) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
