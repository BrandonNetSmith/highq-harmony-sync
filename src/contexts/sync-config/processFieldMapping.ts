
import type { FieldMappingType } from '@/types/field-mapping';
import { defaultFieldMapping } from './types';

export const processFieldMapping = (fieldMapping: any): FieldMappingType => {
  // Parse or initialize field_mapping with the default mapping
  let processedMapping: FieldMappingType;
  
  if (fieldMapping) {
    processedMapping = typeof fieldMapping === 'string'
      ? JSON.parse(fieldMapping)
      : fieldMapping as FieldMappingType;
  } else {
    processedMapping = defaultFieldMapping;
  }
  
  // Ensure each dataType has a keyField property, defaulting to 'email' for contacts
  if (processedMapping.contact && !processedMapping.contact.keyField) {
    processedMapping.contact.keyField = 'email';
    
    // Also ensure email field is marked as isKeyField
    if (processedMapping.contact.fields.email) {
      processedMapping.contact.fields.email.isKeyField = true;
    }
  }

  // For each data type, find the key field and ensure it has isKeyField=true
  Object.keys(processedMapping).forEach(dataType => {
    const keyField = processedMapping[dataType].keyField;
    
    if (keyField && processedMapping[dataType].fields[keyField]) {
      processedMapping[dataType].fields[keyField].isKeyField = true;
      
      // Remove isKeyField=true from all other fields
      Object.keys(processedMapping[dataType].fields).forEach(fieldName => {
        if (fieldName !== keyField) {
          processedMapping[dataType].fields[fieldName].isKeyField = false;
        }
      });
    }
  });

  return processedMapping;
};
