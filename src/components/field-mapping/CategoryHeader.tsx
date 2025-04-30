
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
        {/* Toggle controls on the left */}
        <div className="flex items-center justify-start">
          <SyncToggleControls
            isEnabled={isCategoryEnabled}
            direction={categoryDirection}
            disabled={disabled}
            onToggle={onCategorySyncChange}
            onDirectionChange={onCategoryDirectionChange}
          />
        </div>
        
        {/* Direction controls centered */}
        <div className="flex items-center justify-center">
          {/* Direction toggle will be rendered by SyncToggleControls when enabled */}
        </div>
        
        {/* Right side - possibly for other controls */}
        <div className="flex items-center justify-end">
          {/* This area can be used for additional controls if needed */}
        </div>
      </div>
    </div>
  );
};
