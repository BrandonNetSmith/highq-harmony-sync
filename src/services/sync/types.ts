
import type { FieldMappingType } from "@/types/field-mapping";

// Define SyncDirection to match what's used in the context
export type SyncDirection = 'ghl_to_intakeq' | 'intakeq_to_ghl' | 'bidirectional';

export interface ContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  [key: string]: any;
}

export interface KeyFields {
  [dataType: string]: string;
}
