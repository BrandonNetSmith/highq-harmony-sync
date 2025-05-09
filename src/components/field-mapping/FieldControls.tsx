
import React, { useMemo } from 'react';
import { SyncControls } from './SyncControls';
import { GHLFieldSelect } from './field-selection/GHLFieldSelect';
import { IntakeQFieldSelect } from './field-selection/IntakeQFieldSelect';
import type { FieldControlsProps } from "@/types/field-mapping";
import { toast } from "sonner";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const FieldControls = ({
  dataType,
  fieldName,
  fieldSettings,
  availableFields,
  disabled,
  onFieldChange,
  discoveredFields = {},
}: FieldControlsProps) => {
  // Get discovery state for this specific dataType
  const isGhlDiscovered = discoveredFields[`ghl_${dataType}`] || false;
  const isIntakeqDiscovered = discoveredFields[`intakeq_${dataType}`] || false;
  
  // Memoize the GHL options to avoid recalculating on every render
  const ghlOptions = useMemo(() => {
    // Only return options if discovery has happened
    if (!isGhlDiscovered) return [];
    
    // Get available fields for this dataType, or empty array if none
    return availableFields.ghl[dataType] || [];
  }, [availableFields.ghl, dataType, isGhlDiscovered]);

  // Memoize the IntakeQ options to avoid recalculating on every render
  const intakeqOptions = useMemo(() => {
    // Only return options if discovery has happened
    if (!isIntakeqDiscovered) return [];
    
    // Get available fields for this dataType, or empty array if none
    return availableFields.intakeq[dataType] || [];
  }, [availableFields.intakeq, dataType, isIntakeqDiscovered]);

  // Handler for field changes that automatically saves
  const handleFieldChange = (updates: any) => {
    onFieldChange(dataType, fieldName, updates);
  };

  // Toggle key field status
  const toggleKeyField = () => {
    handleFieldChange({ isKeyField: !fieldSettings.isKeyField });
    
    if (!fieldSettings.isKeyField) {
      toast.success(`Set ${fieldName} as the key matching field for ${dataType}`);
    }
  };

  const keyFieldButtonClass = fieldSettings.isKeyField 
    ? "text-primary-foreground bg-primary hover:bg-primary/90" 
    : "text-muted-foreground";

  return (
    <div className="grid grid-cols-[1fr_auto_auto_1fr] items-center w-full gap-4 py-2 px-2 border-b border-border last:border-b-0">
      <div className="w-full">
        <GHLFieldSelect
          value={fieldSettings.ghlField || ""}
          options={ghlOptions}
          onChange={(value) => {
            handleFieldChange({ ghlField: value });
          }}
          disabled={disabled}
          dataType={dataType}
          fieldName={fieldName}
          isDiscovered={isGhlDiscovered}
        />
      </div>

      <SyncControls
        isEnabled={fieldSettings.sync}
        direction={fieldSettings.direction}
        onToggle={(checked) => {
          handleFieldChange({ sync: checked });
        }}
        onDirectionChange={(direction) => {
          handleFieldChange({ direction });
        }}
        disabled={disabled}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={keyFieldButtonClass}
            onClick={toggleKeyField}
            disabled={disabled}
            aria-label={fieldSettings.isKeyField ? "This is the key matching field" : "Set as key matching field"}
          >
            <Key className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {fieldSettings.isKeyField 
            ? "This field is used to match records between systems" 
            : "Set as the key field for matching records between systems"}
        </TooltipContent>
      </Tooltip>

      <div className="w-full">
        <IntakeQFieldSelect
          value={fieldSettings.intakeqField || ""}
          options={intakeqOptions}
          onChange={(value) => {
            handleFieldChange({ intakeqField: value });
          }}
          disabled={disabled}
          dataType={dataType}
          fieldName={fieldName}
          isDiscovered={isIntakeqDiscovered}
        />
      </div>
    </div>
  );
};
