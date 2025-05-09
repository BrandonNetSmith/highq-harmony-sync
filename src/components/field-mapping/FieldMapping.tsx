
import React, { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AutoSyncToggle } from './AutoSyncToggle';
import { SyncNowButton } from './SyncNowButton';
import { FieldMappingHeader } from './FieldMappingHeader';
import { FieldCategories } from './FieldCategories';
import { useFieldDiscovery } from '@/hooks/use-field-discovery';
import { performSync } from '@/services/syncService';
import type { FieldMappingProps, FieldMappingType } from '@/types/field-mapping';
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

export const FieldMapping = ({ fieldMapping, onChange, disabled = false }: FieldMappingProps) => {
  const { toast } = useToast();
  const [isSyncingNow, setSyncingNow] = useState(false);
  const [isAutoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const { 
    isDiscovering, 
    availableFields, 
    discoveredFields, 
    handleDiscoverFields,
  } = useFieldDiscovery();

  // Debounce the onChange callback to prevent too many updates
  const debouncedOnChange = useCallback((newMapping: FieldMappingType) => {
    onChange(newMapping);
  }, [onChange]);

  const handleFieldChange = useCallback((dataType: string, fieldName: string, updates: any) => {
    const newMapping = { ...fieldMapping };
    
    // Check if this is setting a key field
    if (updates.isKeyField === true) {
      // If setting a new key field, first clear any existing key field for this dataType
      Object.keys(newMapping[dataType].fields).forEach(existingFieldName => {
        if (existingFieldName !== fieldName && newMapping[dataType].fields[existingFieldName].isKeyField) {
          newMapping[dataType].fields[existingFieldName] = {
            ...newMapping[dataType].fields[existingFieldName],
            isKeyField: false
          };
        }
      });
      
      // Update the keyField property at the dataType level
      newMapping[dataType].keyField = fieldName;
    }
    
    // Update the field itself
    newMapping[dataType].fields[fieldName] = {
      ...newMapping[dataType].fields[fieldName],
      ...updates
    };
    
    // Call the onChange handler to save the changes
    debouncedOnChange(newMapping);
  }, [fieldMapping, debouncedOnChange]);

  const handleCategorySyncChange = useCallback((dataType: string, checked: boolean) => {
    const newMapping = { ...fieldMapping };
    Object.keys(newMapping[dataType].fields).forEach(fieldName => {
      newMapping[dataType].fields[fieldName].sync = checked;
    });
    
    // Save changes
    debouncedOnChange(newMapping);
  }, [fieldMapping, debouncedOnChange]);

  const handleCategoryDirectionChange = useCallback((dataType: string, direction: SyncDirection) => {
    const newMapping = { ...fieldMapping };
    Object.keys(newMapping[dataType].fields).forEach(fieldName => {
      if (newMapping[dataType].fields[fieldName].sync) {
        newMapping[dataType].fields[fieldName].direction = direction;
      }
    });
    
    // Save changes
    debouncedOnChange(newMapping);
  }, [fieldMapping, debouncedOnChange]);

  const handleSyncNow = async () => {
    setSyncingNow(true);
    try {
      await performSync();
      toast({
        title: "Sync Complete",
        description: "Manual synchronization was completed successfully",
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync Error",
        description: "Failed to complete synchronization",
        variant: "destructive",
      });
    } finally {
      setSyncingNow(false);
    }
  };

  const handleToggleAutoSync = () => {
    const newAutoSyncState = !isAutoSyncEnabled;
    setAutoSyncEnabled(newAutoSyncState);
    toast({
      title: newAutoSyncState ? "Auto-Sync Enabled" : "Auto-Sync Disabled",
      description: newAutoSyncState 
        ? "Changes will now be automatically synchronized" 
        : "Automatic synchronization has been paused",
    });
  };

  const getCategoryDirection = (dataType: string): SyncDirection | null => {
    const fields = Object.values(fieldMapping[dataType].fields)
      .filter(field => field.sync);
    if (fields.length === 0) return null;
    const firstDirection = fields[0].direction;
    return fields.every(field => field.direction === firstDirection) ? firstDirection : null;
  };

  const getCategorySyncStatus = (dataType: string): boolean => {
    const fields = Object.values(fieldMapping[dataType].fields);
    return fields.some(field => field.sync);
  };

  const dataTypes = ['contact', 'appointment', 'form'];
  const dataTypeLabels: Record<string, string> = {
    contact: 'Contacts',
    appointment: 'Appointments',
    form: 'Forms'
  };

  return (
    <Card className="shadow-sm border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl">Field Level Mapping</CardTitle>
          <CardDescription className="text-base">
            Configure which fields to sync between GoHighLevel and IntakeQ
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <AutoSyncToggle
            isEnabled={isAutoSyncEnabled}
            disabled={disabled}
            onToggle={handleToggleAutoSync}
          />
          <SyncNowButton
            isSyncing={isSyncingNow}
            disabled={disabled}
            onClick={handleSyncNow}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <FieldMappingHeader
          isDiscovering={isDiscovering}
          onDiscoverFields={handleDiscoverFields}
        />
        
        <FieldCategories
          fieldMapping={fieldMapping}
          dataTypes={dataTypes}
          dataTypeLabels={dataTypeLabels}
          availableFields={availableFields}
          disabled={disabled}
          onFieldChange={handleFieldChange}
          onCategorySyncChange={handleCategorySyncChange}
          onCategoryDirectionChange={handleCategoryDirectionChange}
          getCategoryDirection={getCategoryDirection}
          getCategorySyncStatus={getCategorySyncStatus}
          discoveredFields={discoveredFields}
        />
      </CardContent>
    </Card>
  );
};
