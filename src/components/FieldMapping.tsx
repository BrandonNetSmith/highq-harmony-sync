
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft, ArrowRight, ArrowLeftRight, RefreshCw, Edit, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

// Define the FieldMappingType to represent our field mapping structure
type FieldMappingType = {
  [dataType: string]: {
    fields: {
      [fieldName: string]: {
        sync: boolean;
        direction: SyncDirection;
        ghlField?: string;
        intakeqField?: string;
      }
    }
  }
}

interface FieldMappingProps {
  fieldMapping: FieldMappingType;
  onChange: (fieldMapping: FieldMappingType) => void;
  disabled?: boolean;
}

// Enhanced mock function for field discovery that expands custom fields
const discoverFields = async (system: 'ghl' | 'intakeq', dataType: string): Promise<string[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data with expanded custom fields
  const mockFields: Record<string, Record<string, string[]>> = {
    ghl: {
      contact: [
        'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip', 
        'country', 'tags', 'source', 'dateOfBirth', 'companyName', 'website', 'fax',
        'custom.preferredContactMethod', 'custom.leadSource', 'custom.preferredAppointmentTime', 
        'custom.insuranceProvider', 'custom.policyNumber', 'custom.allergies'
      ],
      appointment: [
        'startTime', 'endTime', 'title', 'notes', 'status', 'location', 'provider',
        'custom.followUpRequired', 'custom.appointmentType', 'custom.reasonForVisit'
      ],
      form: [
        'formName', 'description', 'status', 'created', 'updated', 
        'custom.department', 'custom.category', 'custom.priority'
      ]
    },
    intakeq: {
      contact: [
        'firstName', 'lastName', 'email', 'phoneNumber', 'address', 'city', 'state', 
        'zipCode', 'country', 'dateOfBirth', 'gender', 'occupation',
        'custom.emergencyContact', 'custom.referredBy', 'custom.primaryLanguage', 
        'custom.insuranceCompany', 'custom.memberID', 'custom.medicalHistory'
      ],
      appointment: [
        'appointmentDate', 'duration', 'title', 'description', 'status', 'location', 
        'provider', 'custom.virtualMeeting', 'custom.followUpDate', 'custom.notes'
      ],
      form: [
        'formTitle', 'description', 'status', 'createdAt', 'updatedAt', 'formFields',
        'custom.department', 'custom.requiredDocuments', 'custom.expirationDate'
      ]
    }
  };

  return mockFields[system][dataType] || [];
};

export const FieldMapping = ({ fieldMapping, onChange, disabled = false }: FieldMappingProps) => {
  const { toast } = useToast();
  const [isDiscovering, setIsDiscovering] = useState<Record<string, boolean>>({});
  const [editingField, setEditingField] = useState<{dataType: string, fieldName: string, side: 'ghl' | 'intakeq'} | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const handleFieldSyncChange = (dataType: string, field: string, checked: boolean) => {
    const newMapping = { ...fieldMapping };
    newMapping[dataType].fields[field].sync = checked;
    onChange(newMapping);
  };

  const handleFieldDirectionChange = (dataType: string, field: string, direction: SyncDirection) => {
    const newMapping = { ...fieldMapping };
    newMapping[dataType].fields[field].direction = direction;
    onChange(newMapping);
  };

  const handleCategorySyncChange = (dataType: string, checked: boolean) => {
    const newMapping = { ...fieldMapping };
    const fields = Object.keys(newMapping[dataType].fields);
    
    // Apply the sync setting to all fields in this category
    fields.forEach(fieldName => {
      newMapping[dataType].fields[fieldName].sync = checked;
    });
    
    onChange(newMapping);
  };

  const handleCategoryDirectionChange = (dataType: string, direction: SyncDirection) => {
    const newMapping = { ...fieldMapping };
    const fields = Object.keys(newMapping[dataType].fields);
    
    // Apply the new direction to all fields in this category
    fields.forEach(fieldName => {
      if (newMapping[dataType].fields[fieldName].sync) {
        newMapping[dataType].fields[fieldName].direction = direction;
      }
    });
    
    onChange(newMapping);
  };

  const getCategoryDirection = (dataType: string): SyncDirection | null => {
    const fields = Object.values(fieldMapping[dataType].fields)
      .filter(field => field.sync);
    
    if (fields.length === 0) return null;
    
    // If all fields have the same direction, return that direction
    const firstDirection = fields[0].direction;
    return fields.every(field => field.direction === firstDirection) ? firstDirection : null;
  };

  const getCategorySyncStatus = (dataType: string): boolean => {
    const fields = Object.values(fieldMapping[dataType].fields);
    
    // If any fields are synced, consider the category synced
    return fields.some(field => field.sync);
  };

  // Handle starting field name edit
  const handleStartEdit = (dataType: string, fieldName: string, side: 'ghl' | 'intakeq') => {
    const currentValue = side === 'ghl' 
      ? fieldMapping[dataType].fields[fieldName].ghlField || fieldName 
      : fieldMapping[dataType].fields[fieldName].intakeqField || fieldName;
    
    setEditingField({ dataType, fieldName, side });
    setEditValue(currentValue);
  };

  // Handle saving field name edit
  const handleSaveEdit = () => {
    if (editingField) {
      const { dataType, fieldName, side } = editingField;
      const newMapping = { ...fieldMapping };
      
      if (side === 'ghl') {
        newMapping[dataType].fields[fieldName].ghlField = editValue;
      } else {
        newMapping[dataType].fields[fieldName].intakeqField = editValue;
      }
      
      onChange(newMapping);
      setEditingField(null);
    }
  };

  // Enhanced function to discover available fields from both systems
  const handleDiscoverFields = async (dataType: string) => {
    try {
      setIsDiscovering({ ...isDiscovering, [dataType]: true });
      
      // Get fields from both systems
      const [ghlFields, intakeqFields] = await Promise.all([
        discoverFields('ghl', dataType),
        discoverFields('intakeq', dataType)
      ]);
      
      const newMapping = { ...fieldMapping };
      
      // Process GHL fields, including custom fields
      ghlFields.forEach(field => {
        // Check if it's a custom field
        if (field.startsWith('custom.')) {
          const customFieldName = field.split('.')[1].toLowerCase();
          const existingFieldKey = Object.keys(newMapping[dataType].fields).find(
            key => newMapping[dataType].fields[key].ghlField?.toLowerCase() === field.toLowerCase()
          );
          
          if (!existingFieldKey) {
            // Create new field entry
            const normalizedName = `custom_${customFieldName}`;
            newMapping[dataType].fields[normalizedName] = {
              sync: false,
              direction: 'bidirectional',
              ghlField: field,
              intakeqField: ''
            };
          }
        } else {
          // Regular field
          const normalizedField = field.toLowerCase().replace(/\s+/g, '_');
          
          if (!newMapping[dataType].fields[normalizedField]) {
            newMapping[dataType].fields[normalizedField] = {
              sync: false,
              direction: 'bidirectional',
              ghlField: field,
              intakeqField: ''
            };
          } else if (!newMapping[dataType].fields[normalizedField].ghlField) {
            newMapping[dataType].fields[normalizedField].ghlField = field;
          }
        }
      });
      
      // Process IntakeQ fields, including custom fields
      intakeqFields.forEach(field => {
        // Check if it's a custom field
        if (field.startsWith('custom.')) {
          const customFieldName = field.split('.')[1].toLowerCase();
          const existingFieldKey = Object.keys(newMapping[dataType].fields).find(
            key => newMapping[dataType].fields[key].intakeqField?.toLowerCase() === field.toLowerCase()
          );
          
          if (!existingFieldKey) {
            // Create new field entry or find matching GHL custom field
            const matchingGhlField = Object.keys(newMapping[dataType].fields).find(
              key => key.startsWith('custom_') && key.substring(7) === customFieldName
            );
            
            if (matchingGhlField) {
              // Update existing entry if field names match
              newMapping[dataType].fields[matchingGhlField].intakeqField = field;
            } else {
              // Create new entry
              const normalizedName = `custom_${customFieldName}`;
              newMapping[dataType].fields[normalizedName] = {
                sync: false,
                direction: 'bidirectional',
                ghlField: '',
                intakeqField: field
              };
            }
          }
        } else {
          // Regular field
          const normalizedField = field.toLowerCase().replace(/\s+/g, '_');
          
          if (!newMapping[dataType].fields[normalizedField]) {
            newMapping[dataType].fields[normalizedField] = {
              sync: false,
              direction: 'bidirectional',
              ghlField: '',
              intakeqField: field
            };
          } else if (!newMapping[dataType].fields[normalizedField].intakeqField) {
            newMapping[dataType].fields[normalizedField].intakeqField = field;
          }
        }
      });
      
      // Update the field mapping
      onChange(newMapping);
      
      toast({
        title: "Fields discovered",
        description: `${ghlFields.length + intakeqFields.length} total fields found for ${dataType}`,
      });
    } catch (error) {
      console.error(`Error discovering fields for ${dataType}:`, error);
      toast({
        title: "Error",
        description: `Failed to discover fields for ${dataType}`,
        variant: "destructive",
      });
    } finally {
      setIsDiscovering({ ...isDiscovering, [dataType]: false });
    }
  };

  // Data types to display in the mapping UI
  const dataTypes = ['contact', 'appointment', 'form'];
  const dataTypeLabels: Record<string, string> = {
    contact: 'Contacts',
    appointment: 'Appointments',
    form: 'Forms'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Level Mapping</CardTitle>
        <CardDescription>Configure which fields to sync between GoHighLevel and IntakeQ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Column Headers - Always visible */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4">
          <div className="bg-muted/30 p-3 font-semibold text-center rounded-md">GoHighLevel</div>
          <div className="flex items-center justify-center font-medium">Sync Direction</div>
          <div className="bg-muted/30 p-3 font-semibold text-center rounded-md">IntakeQ</div>
        </div>

        <Accordion type="multiple" className="w-full">
          {dataTypes.map(dataType => {
            const categoryDirection = getCategoryDirection(dataType);
            const isCategoryEnabled = getCategorySyncStatus(dataType);
            
            return (
              <AccordionItem key={dataType} value={dataType} className="border rounded-md mb-4">
                <div className="flex flex-col">
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 bg-muted/30">
                    {/* GHL Side Title */}
                    <div className="p-4">
                      <AccordionTrigger className="hover:no-underline w-full text-left">
                        <h3 className="text-lg font-medium capitalize text-left">{dataTypeLabels[dataType] || dataType}</h3>
                      </AccordionTrigger>
                    </div>
                    
                    {/* Category-level sync controls */}
                    <div className="flex items-center justify-center gap-2 p-2">
                      <Switch
                        id={`${dataType}-category-sync`}
                        checked={isCategoryEnabled}
                        onCheckedChange={(checked) => handleCategorySyncChange(dataType, checked)}
                        disabled={disabled}
                      />
                      
                      {isCategoryEnabled && (
                        <ToggleGroup
                          type="single"
                          size="sm"
                          value={categoryDirection || undefined}
                          onValueChange={(value) => {
                            if (value) handleCategoryDirectionChange(dataType, value as SyncDirection);
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
                    
                    {/* IntakeQ Side Title */}
                    <div className="p-4 flex justify-end items-center">
                      <div className="text-lg font-medium capitalize text-right">{dataTypeLabels[dataType] || dataType}</div>
                    </div>
                  </div>
                
                  <AccordionContent className="p-4">
                    <div className="space-y-4">
                      {/* Discover Fields Button */}
                      <div className="flex justify-end mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDiscoverFields(dataType)}
                          disabled={disabled || isDiscovering[dataType]}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className={`h-4 w-4 ${isDiscovering[dataType] ? 'animate-spin' : ''}`} />
                          Discover Available Fields
                        </Button>
                      </div>
                      
                      {/* Field rows */}
                      {fieldMapping[dataType] && Object.entries(fieldMapping[dataType].fields).map(([fieldName, fieldSettings]) => (
                        <div key={fieldName} className="border rounded-lg">
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-4 hover:bg-muted/10 transition-colors">
                            {/* GHL Side */}
                            <div className="text-left p-4 bg-background rounded-l-lg flex items-center">
                              {editingField?.dataType === dataType && 
                               editingField?.fieldName === fieldName && 
                               editingField?.side === 'ghl' ? (
                                <div className="flex items-center gap-2 w-full">
                                  <Input 
                                    value={editValue} 
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="text-sm"
                                    autoFocus
                                  />
                                  <Button
                                    variant="ghost" 
                                    size="icon"
                                    onClick={handleSaveEdit}
                                    className="h-8 w-8"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="font-medium capitalize flex-grow">
                                    {fieldSettings.ghlField || fieldName.replace(/_/g, ' ')}
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleStartEdit(dataType, fieldName, 'ghl')}
                                    disabled={disabled}
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                            
                            {/* Sync Controls */}
                            <div className="flex flex-col items-center justify-center py-2 gap-2">
                              <Switch
                                id={`${dataType}-${fieldName}-sync`}
                                checked={fieldSettings.sync}
                                onCheckedChange={(checked) => handleFieldSyncChange(dataType, fieldName, checked)}
                                disabled={disabled}
                              />
                              
                              {fieldSettings.sync && (
                                <ToggleGroup
                                  type="single"
                                  size="sm"
                                  value={fieldSettings.direction}
                                  onValueChange={(value) => {
                                    if (value) handleFieldDirectionChange(dataType, fieldName, value as SyncDirection);
                                  }}
                                  className="flex gap-0 border rounded-md overflow-hidden"
                                  disabled={disabled || !fieldSettings.sync}
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
                            
                            {/* IntakeQ Side */}
                            <div className="text-right p-4 bg-background rounded-r-lg flex items-center justify-end">
                              {editingField?.dataType === dataType && 
                               editingField?.fieldName === fieldName && 
                               editingField?.side === 'intakeq' ? (
                                <div className="flex items-center gap-2 w-full justify-end">
                                  <Button
                                    variant="ghost" 
                                    size="icon"
                                    onClick={handleSaveEdit}
                                    className="h-8 w-8"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Input 
                                    value={editValue} 
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="text-sm text-right"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleStartEdit(dataType, fieldName, 'intakeq')}
                                    disabled={disabled}
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity mr-2"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <span className="font-medium capitalize flex-grow text-right">
                                    {fieldSettings.intakeqField || fieldName.replace(/_/g, ' ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};
