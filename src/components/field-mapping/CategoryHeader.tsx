
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
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 bg-muted/30 rounded-t-md">
      <CategoryTitle label={label} position="left" />
      
      <SyncToggleControls
        isEnabled={isCategoryEnabled}
        direction={categoryDirection}
        disabled={disabled}
        onToggle={onCategorySyncChange}
        onDirectionChange={onCategoryDirectionChange}
      />
      
      <CategoryTitle label={label} position="right" />
    </div>
  );
};
