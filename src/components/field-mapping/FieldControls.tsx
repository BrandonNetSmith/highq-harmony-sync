
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

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-4 py-2 px-2 border-b border-border last:border-b-0">
      <div className="w-full">
        <GHLFieldSelect
          value={fieldSettings.ghlField || ""}
          options={ghlOptions}
          onChange={(value) => {
            onFieldChange(dataType, fieldName, { ghlField: value });
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
          onFieldChange(dataType, fieldName, { sync: checked });
        }}
        onDirectionChange={(direction) => {
          onFieldChange(dataType, fieldName, { direction });
        }}
        disabled={disabled}
      />

      <div className="w-full">
        <IntakeQFieldSelect
          value={fieldSettings.intakeqField || ""}
          options={intakeqOptions}
          onChange={(value) => {
            onFieldChange(dataType, fieldName, { intakeqField: value });
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
