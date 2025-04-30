
import React from 'react';
import { AccordionTrigger } from "@/components/ui/accordion";
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
      {/* Centered label row with accordion trigger */}
      <AccordionTrigger className="flex flex-col w-full py-2">
        <h3 className="text-lg font-medium capitalize">{label}</h3>
      </AccordionTrigger>
      
      {/* Controls row with grid layout */}
      <div className="grid grid-cols-3 px-4 pb-2">
        {/* Toggle controls on the left */}
        <div className="flex flex-col items-start justify-start">
          <div className="flex items-center gap-2">
            <SyncToggleControls
              isEnabled={isCategoryEnabled}
              direction={categoryDirection}
              disabled={disabled}
              onToggle={onCategorySyncChange}
              onDirectionChange={onCategoryDirectionChange}
              displayDirectionControls={false} // Don't show direction controls here
            />
          </div>
        </div>
        
        {/* Direction controls in the middle/center */}
        <div className="flex flex-col items-center justify-center">
          {isCategoryEnabled && (
            <SyncToggleControls
              isEnabled={isCategoryEnabled}
              direction={categoryDirection}
              disabled={disabled}
              onToggle={onCategorySyncChange}
              onDirectionChange={onCategoryDirectionChange}
              displayToggle={false} // Don't show toggle here
              centerDirectionControls={true}
            />
          )}
        </div>
        
        {/* Right side - for other controls if needed */}
        <div className="flex items-center justify-end">
          {/* This area can be used for additional controls if needed */}
        </div>
      </div>
    </div>
  );
};
