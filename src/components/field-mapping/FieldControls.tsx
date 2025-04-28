
import React from 'react';
import { SyncControls } from './SyncControls';
import { GHLFieldSelect } from './field-selection/GHLFieldSelect';
import { IntakeQFieldSelect } from './field-selection/IntakeQFieldSelect';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { FieldControlsProps } from "@/types/field-mapping";

export const FieldControls = ({
  dataType,
  fieldName,
  fieldSettings,
  availableFields,
  disabled,
  onFieldChange,
  onDiscoverFields,
}: FieldControlsProps) => {
  const ghlOptions = availableFields.ghl[dataType] || [fieldName];
  const intakeqOptions = availableFields.intakeq[dataType] || [fieldName];

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-4 hover:bg-muted/10 transition-colors">
      <div className="flex flex-col gap-2">
        <GHLFieldSelect
          value={fieldSettings.ghlField || fieldName}
          options={ghlOptions}
          onChange={(value) => {
            onFieldChange(dataType, fieldName, { ghlField: value });
          }}
          disabled={disabled}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDiscoverFields('ghl', dataType)}
          disabled={disabled}
          className="w-full flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Discover GHL Fields
        </Button>
      </div>

      <SyncControls
        isEnabled={fieldSettings.sync}
        direction={fieldSettings.direction}
        onToggle={(checked) => {
          onFieldChange(dataType, fieldName, { sync: checked });
        }}
        onDirectionChange={(direction) => {
          onFieldChange(dataType, fieldName, { direction });
        }}
        disabled={disabled}
      />

      <div className="flex flex-col gap-2">
        <IntakeQFieldSelect
          value={fieldSettings.intakeqField || fieldName}
          options={intakeqOptions}
          onChange={(value) => {
            onFieldChange(dataType, fieldName, { intakeqField: value });
          }}
          disabled={disabled}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDiscoverFields('intakeq', dataType)}
          disabled={disabled}
          className="w-full flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Discover IntakeQ Fields
        </Button>
      </div>
    </div>
  );
};
