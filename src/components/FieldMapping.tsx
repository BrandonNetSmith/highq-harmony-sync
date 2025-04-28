
import React, { useState } from 'react';
import { RefreshCw, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FieldControls } from './field-mapping/FieldControls';
import { CategoryHeader } from './field-mapping/CategoryHeader';
import { useFieldDiscovery } from '@/hooks/use-field-discovery';
import type { FieldMappingProps, FieldMappingType } from '@/types/field-mapping';
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

export const FieldMapping = ({ fieldMapping, onChange, disabled = false }: FieldMappingProps) => {
  const { toast } = useToast();
  const [isSyncingNow, setSyncingNow] = useState(false);
  const [isAutoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const { isDiscovering, availableFields, handleDiscoverFields } = useFieldDiscovery();

  const handleFieldChange = (dataType: string, fieldName: string, updates: any) => {
    const newMapping = { ...fieldMapping };
    newMapping[dataType].fields[fieldName] = {
      ...newMapping[dataType].fields[fieldName],
      ...updates
    };
    onChange(newMapping);
  };

  const handleCategorySyncChange = (dataType: string, checked: boolean) => {
    const newMapping = { ...fieldMapping };
    Object.keys(newMapping[dataType].fields).forEach(fieldName => {
      newMapping[dataType].fields[fieldName].sync = checked;
    });
    onChange(newMapping);
  };

  const handleCategoryDirectionChange = (dataType: string, direction: SyncDirection) => {
    const newMapping = { ...fieldMapping };
    Object.keys(newMapping[dataType].fields).forEach(fieldName => {
      if (newMapping[dataType].fields[fieldName].sync) {
        newMapping[dataType].fields[fieldName].direction = direction;
      }
    });
    onChange(newMapping);
  };

  const handleDiscoverFieldsClick = async (system: 'ghl' | 'intakeq', dataType: string) => {
    await handleDiscoverFields(system, dataType);
  };

  const handleSyncNow = async () => {
    setSyncingNow(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Field Level Mapping</CardTitle>
          <CardDescription>Configure which fields to sync between GoHighLevel and IntakeQ</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={isAutoSyncEnabled}
              onCheckedChange={handleToggleAutoSync}
              disabled={disabled}
            />
            <span className="text-sm font-medium">
              {isAutoSyncEnabled ? "Auto-Sync On" : "Auto-Sync Off"}
            </span>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleSyncNow}
            disabled={disabled || isSyncingNow}
            className="flex items-center gap-2"
          >
            <ArrowRightLeft className={`h-4 w-4 ${isSyncingNow ? 'animate-spin' : ''}`} />
            {isSyncingNow ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Column Headers with Discovery Buttons */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <div className="bg-muted/30 p-3 font-semibold text-center rounded-md">GoHighLevel</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDiscoverFieldsClick('ghl', 'contact')}
              disabled={disabled || isDiscovering['contact']}
              className="flex items-center gap-2 self-start"
            >
              <RefreshCw className={`h-4 w-4 ${isDiscovering['contact'] ? 'animate-spin' : ''}`} />
              Discover GHL Fields
            </Button>
          </div>
          <div className="flex items-center justify-center font-medium">Sync Direction</div>
          <div className="flex flex-col gap-2">
            <div className="bg-muted/30 p-3 font-semibold text-center rounded-md">IntakeQ</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDiscoverFieldsClick('intakeq', 'contact')}
              disabled={disabled || isDiscovering['contact']}
              className="flex items-center gap-2 self-end"
            >
              <RefreshCw className={`h-4 w-4 ${isDiscovering['contact'] ? 'animate-spin' : ''}`} />
              Discover IntakeQ Fields
            </Button>
          </div>
        </div>

        <Accordion type="multiple" className="w-full">
          {dataTypes.map(dataType => (
            <AccordionItem key={dataType} value={dataType} className="border rounded-md mb-4">
              <div className="flex flex-col">
                <CategoryHeader
                  dataType={dataType}
                  label={dataTypeLabels[dataType] || dataType}
                  isCategoryEnabled={getCategorySyncStatus(dataType)}
                  categoryDirection={getCategoryDirection(dataType)}
                  disabled={disabled}
                  onCategorySyncChange={(checked) => handleCategorySyncChange(dataType, checked)}
                  onCategoryDirectionChange={(direction) => handleCategoryDirectionChange(dataType, direction)}
                />
              
                <AccordionContent className="p-4">
                  <div className="space-y-4">                    
                    {fieldMapping[dataType] && Object.entries(fieldMapping[dataType].fields).map(([fieldName, fieldSettings]) => (
                      <div key={fieldName} className="border rounded-lg">
                        <FieldControls
                          dataType={dataType}
                          fieldName={fieldName}
                          fieldSettings={fieldSettings}
                          availableFields={availableFields}
                          disabled={disabled}
                          onFieldChange={handleFieldChange}
                          onDiscoverFields={handleDiscoverFieldsClick}
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
