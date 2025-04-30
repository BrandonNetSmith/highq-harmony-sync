
import React from 'react';
import { CategoryTitle } from './CategoryTitle';
import { SyncToggleControls } from './sync/SyncToggleControls';
import type { CategoryHeaderProps } from "@/types/field-mapping";

export const CategoryHeader = ({
  dataType,
  label,
  isCategoryEnabled,
  categoryDirection,
  disabled,
  onCategorySyncChange,
  onCategoryDirectionChange,
}: CategoryHeaderProps) => {
  return (
    <div className="flex flex-col bg-muted/30 rounded-t-md">
      {/* Centered label row */}
      <div className="text-center py-2">
        <h3 className="text-lg font-medium capitalize">{label}</h3>
      </div>
      
      {/* Controls row with grid layout */}
      <div className="grid grid-cols-3 px-4 pb-2">
        {/* Toggle and direction controls on the left */}
        <div className="flex flex-col items-start justify-start">
          <SyncToggleControls
            isEnabled={isCategoryEnabled}
            direction={categoryDirection}
            disabled={disabled}
            onToggle={onCategorySyncChange}
            onDirectionChange={onCategoryDirectionChange}
          />
        </div>
        
        {/* Middle section - empty for spacing */}
        <div className="flex items-center justify-center">
          {/* This area is intentionally left empty for spacing */}
        </div>
        
        {/* Right side - for other controls if needed */}
        <div className="flex items-center justify-end">
          {/* This area can be used for additional controls if needed */}
        </div>
      </div>
    </div>
  );
};
