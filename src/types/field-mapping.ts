
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

export type FieldMappingType = {
  [dataType: string]: {
    keyField?: string; // The field name designated as the key field for matching
    fields: {
      [fieldName: string]: {
        sync: boolean;
        direction: SyncDirection;
        ghlField?: string;
        intakeqField?: string;
        isKeyField?: boolean; // Flag to indicate if this field is the key field
      }
    }
  }
}

export interface FieldMappingProps {
  fieldMapping: FieldMappingType;
  onChange: (fieldMapping: FieldMappingType) => void;
  disabled?: boolean;
}

export interface FieldControlsProps {
  dataType: string;
  fieldName: string;
  fieldSettings: {
    sync: boolean;
    direction: SyncDirection;
    ghlField?: string;
    intakeqField?: string;
    isKeyField?: boolean;
  };
  availableFields: {
    ghl: { [key: string]: string[] };
    intakeq: { [key: string]: string[] };
  };
  disabled?: boolean;
  discoveredFields?: Record<string, boolean>;
  onFieldChange: (
    dataType: string,
    fieldName: string,
    updates: Partial<{
      sync: boolean;
      direction: SyncDirection;
      ghlField: string;
      intakeqField: string;
      isKeyField: boolean;
    }>
  ) => void;
}

export interface CategoryHeaderProps {
  dataType: string;
  label: string;
  isCategoryEnabled: boolean;
  categoryDirection: SyncDirection | null;
  disabled?: boolean;
  onCategorySyncChange: (checked: boolean) => void;
  onCategoryDirectionChange: (direction: SyncDirection) => void;
}
