import { SyncDirection } from './types';
import { FieldMappingType } from "@/types/field-mapping";

/**
 * Helper function to get a user-friendly message for sync direction
 */
export const getDirectionMessage = (direction: SyncDirection): string => {
  switch (direction) {
    case 'ghl_to_intakeq':
      return 'GoHighLevel to IntakeQ';
    case 'intakeq_to_ghl':
      return 'IntakeQ to GoHighLevel';
    case 'bidirectional':
    default:
      return 'Bidirectional sync';
  }
};

/**
 * Helper function to extract key fields from field mapping
 */
export const getKeyFieldsByDataType = (fieldMapping: FieldMappingType): Record<string, string> => {
  const keyFields: Record<string, string> = {};
  
  Object.keys(fieldMapping).forEach(dataType => {
    // Check if there's a keyField specified at the dataType level
    if (fieldMapping[dataType].keyField) {
      keyFields[dataType] = fieldMapping[dataType].keyField!;
      return;
    }
    
    // Otherwise look for a field with isKeyField=true
    const fields = fieldMapping[dataType].fields;
    const keyFieldEntry = Object.entries(fields).find(
      ([_, fieldSettings]) => fieldSettings.isKeyField
    );
    
    if (keyFieldEntry) {
      keyFields[dataType] = keyFieldEntry[0];
    } else if (dataType === 'contact') {
      // Default to email for contacts if no key field is specified
      keyFields[dataType] = 'email';
    }
  });
  
  return keyFields;
};

/**
 * Maps database sync direction to the internal sync direction type
 * @param dbSyncDirection The sync direction from the database
 * @returns The internal sync direction type
 */
export const mapDatabaseSyncDirection = (dbSyncDirection: string): SyncDirection => {
  if (dbSyncDirection === 'one_way_ghl_to_intakeq') {
    return 'ghl_to_intakeq';
  } else if (dbSyncDirection === 'one_way_intakeq_to_ghl') {
    return 'intakeq_to_ghl';
  } else {
    return 'bidirectional';
  }
};
