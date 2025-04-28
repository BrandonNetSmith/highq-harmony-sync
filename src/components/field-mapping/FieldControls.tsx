
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
  // Ensure we have all field options available or use defaults
  const ghlOptions = availableFields.ghl[dataType] || [fieldName];
  const intakeqOptions = availableFields.intakeq[dataType] || [fieldName];

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-4 hover:bg-muted/10 transition-colors">
      <GHLFieldSelect
        value={fieldSettings.ghlField || fieldName}
        options={ghlOptions}
        onChange={(value) => {
          onFieldChange(dataType, fieldName, { ghlField: value });
        }}
        disabled={disabled}
      />

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

      <IntakeQFieldSelect
        value={fieldSettings.intakeqField || fieldName}
        options={intakeqOptions}
        onChange={(value) => {
          onFieldChange(dataType, fieldName, { intakeqField: value });
        }}
        disabled={disabled}
      />
    </div>
  );
};
