
import type { Database } from "@/integrations/supabase/types";
import type { FieldMappingType } from '@/types/field-mapping';

export type SyncDirection = Database["public"]["Enums"]["sync_direction"];

export interface SyncConfigContextType {
  syncConfig: {
    sync_direction: SyncDirection;
    ghl_filters: { contactIds: string[], tags: string[], status: string[] };
    intakeq_filters: { clientIds: string[], formIds: string[], status: string[] };
    is_sync_enabled: boolean;
    field_mapping: FieldMappingType;
  };
  isLoading: boolean;
  handleSyncDirectionChange: (direction: SyncDirection) => Promise<void>;
  handleFiltersChange: (type: 'ghl' | 'intakeq', filters: any) => Promise<void>;
  handleFieldMappingChange: (fieldMapping: FieldMappingType) => Promise<void>;
}

export const defaultFieldMapping: FieldMappingType = {
  contact: {
    keyField: 'email',
    fields: {
      first_name: { sync: true, direction: 'bidirectional', ghlField: 'firstName', intakeqField: 'firstName' },
      last_name: { sync: true, direction: 'bidirectional', ghlField: 'lastName', intakeqField: 'lastName' },
      email: { sync: true, direction: 'bidirectional', isKeyField: true },
      phone: { sync: true, direction: 'bidirectional', ghlField: 'phone', intakeqField: 'phoneNumber' },
      address: { sync: true, direction: 'bidirectional' }
    }
  },
  appointment: {
    fields: {
      datetime: { sync: true, direction: 'bidirectional', ghlField: 'startTime', intakeqField: 'appointmentDate' },
      status: { sync: true, direction: 'bidirectional' },
      notes: { sync: true, direction: 'bidirectional', ghlField: 'notes', intakeqField: 'description' }
    }
  },
  form: {
    fields: {
      name: { sync: true, direction: 'bidirectional', ghlField: 'formName', intakeqField: 'formTitle' },
      description: { sync: true, direction: 'bidirectional' },
      status: { sync: true, direction: 'bidirectional' }
    }
  }
};

export const initialSyncConfig = {
  sync_direction: 'bidirectional' as SyncDirection,
  ghl_filters: { contactIds: [], tags: [], status: [] },
  intakeq_filters: { clientIds: [], formIds: [], status: [] },
  is_sync_enabled: false,
  field_mapping: defaultFieldMapping
};
