
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
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 pb-2">
        {/* Toggle controls moved to left */}
        <SyncToggleControls
          isEnabled={isCategoryEnabled}
          direction={categoryDirection}
          disabled={disabled}
          onToggle={onCategorySyncChange}
          onDirectionChange={onCategoryDirectionChange}
        />
        
        {/* Empty middle section */}
        <div></div>
        
        {/* Right side - empty or can be used for other controls */}
        <div></div>
      </div>
    </div>
  );
};
