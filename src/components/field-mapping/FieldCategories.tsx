
import React from 'react';
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { AccordionContent } from './AccordionContent';
import { FieldControls } from './FieldControls';
import { CategoryHeader } from './CategoryHeader';
import type { FieldMappingType } from '@/types/field-mapping';
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

interface FieldCategoriesProps {
  fieldMapping: FieldMappingType;
  dataTypes: string[];
  dataTypeLabels: Record<string, string>;
  availableFields: {
    ghl: { [key: string]: string[] };
    intakeq: { [key: string]: string[] };
  };
  disabled: boolean;
  onFieldChange: (dataType: string, fieldName: string, updates: any) => void;
  onCategorySyncChange: (dataType: string, checked: boolean) => void;
  onCategoryDirectionChange: (dataType: string, direction: SyncDirection) => void;
  getCategoryDirection: (dataType: string) => SyncDirection | null;
  getCategorySyncStatus: (dataType: string) => boolean;
  discoveredFields?: Record<string, boolean>;
}

export const FieldCategories = ({
  fieldMapping,
  dataTypes,
  dataTypeLabels,
  availableFields,
  disabled,
  onFieldChange,
  onCategorySyncChange,
  onCategoryDirectionChange,
  getCategoryDirection,
  getCategorySyncStatus,
  discoveredFields = {},
}: FieldCategoriesProps) => {
  return (
    <Accordion type="multiple" className="w-full">
      {dataTypes.map(dataType => (
        <AccordionItem key={dataType} value={dataType} className="border rounded-md mb-4">
          <CategoryHeader
            dataType={dataType}
            label={dataTypeLabels[dataType] || dataType}
            isCategoryEnabled={getCategorySyncStatus(dataType)}
            categoryDirection={getCategoryDirection(dataType)}
            disabled={disabled}
            onCategorySyncChange={(checked) => onCategorySyncChange(dataType, checked)}
            onCategoryDirectionChange={(direction) => onCategoryDirectionChange(dataType, direction)}
          />
          
          <AccordionContent className="p-2">
            <div className="space-y-0">                    
              {fieldMapping[dataType] && Object.entries(fieldMapping[dataType].fields).map(([fieldName, fieldSettings]) => (
                <FieldControls
                  key={`${dataType}_${fieldName}`}
                  dataType={dataType}
                  fieldName={fieldName}
                  fieldSettings={fieldSettings}
                  availableFields={availableFields}
                  disabled={disabled}
                  onFieldChange={onFieldChange}
                  discoveredFields={discoveredFields}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
