
import React from 'react';
import { ArrowLeft, ArrowRight, ArrowLeftRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AccordionTrigger } from "@/components/ui/accordion";
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
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 bg-muted/30">
      {/* Title Left */}
      <div className="p-4">
        <AccordionTrigger className="hover:no-underline w-full text-left">
          <h3 className="text-lg font-medium capitalize text-left">{label}</h3>
        </AccordionTrigger>
      </div>
      
      {/* Category-level sync controls */}
      <div className="flex items-center justify-center gap-2 p-2">
        <Switch
          id={`${dataType}-category-sync`}
          checked={isCategoryEnabled}
          onCheckedChange={onCategorySyncChange}
          disabled={disabled}
        />
        
        {isCategoryEnabled && (
          <ToggleGroup
            type="single"
            size="sm"
            value={categoryDirection || undefined}
            onValueChange={(value: any) => {
              if (value) onCategoryDirectionChange(value);
            }}
            className="flex gap-0 border rounded-md overflow-hidden"
            disabled={disabled || !isCategoryEnabled}
          >
            <ToggleGroupItem 
              value="one_way_intakeq_to_ghl"
              aria-label="IntakeQ to GHL"
              className="px-2 rounded-none border-r data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="bidirectional"
              aria-label="Bidirectional"
              className="px-2 rounded-none border-r data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="one_way_ghl_to_intakeq"
              aria-label="GHL to IntakeQ"
              className="px-2 rounded-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <ArrowRight className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>
      
      {/* Title Right */}
      <div className="p-4 flex justify-end items-center">
        <div className="text-lg font-medium capitalize text-right">{label}</div>
      </div>
    </div>
  );
};
