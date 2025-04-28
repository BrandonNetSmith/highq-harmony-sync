
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
    // Get the current field value, fallback to fieldName if not set
    const currentField = fieldSettings.ghlField || fieldName;
    
    // Get available fields for this dataType, or empty array if none
    const dataTypeFields = availableFields.ghl[dataType] || [];
    
    // Start with the current field to ensure it's always in the list
    let options = [currentField];
    
    // Add discovered fields if we have them (avoiding duplicates)
    if (dataTypeFields.length > 0) {
      options = [...new Set([currentField, ...dataTypeFields])].filter(Boolean);
    }
    
    console.log(`GHL options for ${dataType}.${fieldName}:`, options);
    return options;
  }, [availableFields.ghl, dataType, fieldName, fieldSettings.ghlField]);

  const intakeqOptions = useMemo(() => {
    // Get the current field value, fallback to fieldName if not set
    const currentField = fieldSettings.intakeqField || fieldName;
    
    // Get available fields for this dataType, or empty array if none
    const dataTypeFields = availableFields.intakeq[dataType] || [];
    
    // Start with the current field to ensure it's always in the list
    let options = [currentField];
    
    // Add discovered fields if we have them (avoiding duplicates)
    if (dataTypeFields.length > 0) {
      options = [...new Set([currentField, ...dataTypeFields])].filter(Boolean);
    }
    
    console.log(`IntakeQ options for ${dataType}.${fieldName}:`, options);
    return options;
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
          dataType={dataType}
          fieldName={fieldName}
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
          dataType={dataType}
          fieldName={fieldName}
        />
      </div>
    </div>
  );
};
