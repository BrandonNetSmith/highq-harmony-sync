
import React from 'react';
import { SyncControls } from './SyncControls';
import { GHLFieldSelect } from './field-selection/GHLFieldSelect';
import { IntakeQFieldSelect } from './field-selection/IntakeQFieldSelect';
import type { FieldControlsProps } from "@/types/field-mapping";

export const FieldControls = ({
  dataType,
  fieldName,
  fieldSettings,
  availableFields,
  disabled,
  onFieldChange,
}: FieldControlsProps) => {
  // Ensure we always have at least the current field name in the options
  const ghlOptions = (availableFields.ghl[dataType] || []).length > 0 
    ? availableFields.ghl[dataType] 
    : [fieldName];

  const intakeqOptions = (availableFields.intakeq[dataType] || []).length > 0 
    ? availableFields.intakeq[dataType] 
    : [fieldName];

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-4 py-2 px-2 border-b border-border last:border-b-0">
      <div className="w-full">
        <GHLFieldSelect
          value={fieldSettings.ghlField || fieldName}
          options={ghlOptions}
          onChange={(value) => {
            onFieldChange(dataType, fieldName, { ghlField: value });
          }}
          disabled={disabled}
        />
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

      <div className="w-full">
        <IntakeQFieldSelect
          value={fieldSettings.intakeqField || fieldName}
          options={intakeqOptions}
          onChange={(value) => {
            onFieldChange(dataType, fieldName, { intakeqField: value });
          }}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
