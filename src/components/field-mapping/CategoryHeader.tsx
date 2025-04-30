
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
      
      {/* Controls row */}
      <div className="grid grid-cols-3 gap-4 px-4 pb-2">
        {/* Toggle controls on the left */}
        <div className="flex justify-start">
          <SyncToggleControls
            isEnabled={isCategoryEnabled}
            direction={categoryDirection}
            disabled={disabled}
            onToggle={onCategorySyncChange}
            onDirectionChange={onCategoryDirectionChange}
          />
        </div>
        
        {/* Middle section - empty to maintain spacing */}
        <div className="flex justify-center">
          {/* This empty div helps maintain the grid structure */}
        </div>
        
        {/* Right side - for other controls or empty to maintain spacing */}
        <div className="flex justify-end">
          {/* This empty div helps maintain the grid structure */}
        </div>
      </div>
    </div>
  );
};
