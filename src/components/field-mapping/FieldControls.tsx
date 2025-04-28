
import React, { useMemo } from 'react';
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
  // Memoize the options to avoid recalculating on every render
  const ghlOptions = useMemo(() => {
    // Always include the current field or mapping if available
    const currentField = fieldSettings.ghlField || fieldName;
    const dataTypeFields = availableFields.ghl[dataType] || [];
    
    // If we have fields from discovery, use them - otherwise just use the current field
    if (dataTypeFields.length > 0) {
      return [...new Set([...dataTypeFields, currentField])];
    }
    return [currentField];
  }, [availableFields.ghl, dataType, fieldName, fieldSettings.ghlField]);

  const intakeqOptions = useMemo(() => {
    // Always include the current field or mapping if available
    const currentField = fieldSettings.intakeqField || fieldName;
    const dataTypeFields = availableFields.intakeq[dataType] || [];
    
    // If we have fields from discovery, use them - otherwise just use the current field
    if (dataTypeFields.length > 0) {
      return [...new Set([...dataTypeFields, currentField])];
    }
    return [currentField];
  }, [availableFields.intakeq, dataType, fieldName, fieldSettings.intakeqField]);

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
