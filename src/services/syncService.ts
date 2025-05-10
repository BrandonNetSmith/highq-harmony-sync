import { toast } from "sonner";
import { createSyncActivityLog } from "./syncActivityLogs";
import { getSyncConfig } from "./syncConfig";
import { getApiKeys } from "./apiKeys";
import { supabase } from "@/integrations/supabase/client";
import type { SyncActivityLog } from "@/components/SyncActivityLogModal";
import type { FieldMappingType } from "@/types/field-mapping";

/**
 * Initiates a synchronization between GoHighLevel and IntakeQ
 * @param direction Optional override for the sync direction
 */
export const performSync = async (
  direction?: 'ghl_to_intakeq' | 'intakeq_to_ghl' | 'bidirectional'
): Promise<void> => {
  try {
    // Get current sync configuration
    const config = await getSyncConfig();
    
    if (!config) {
      toast.error("Sync configuration not found");
      return;
    }

    // Get API keys
    const apiKeys = await getApiKeys();
    if (!apiKeys?.ghl_key || !apiKeys?.intakeq_key) {
      toast.error("API keys not configured. Please set up both GoHighLevel and IntakeQ API keys.");
      return;
    }

    // If no direction provided, use the one from config
    const syncDirection = direction || config.sync_direction;
    
    // Parse field mapping if it's a string
    const fieldMapping: FieldMappingType = typeof config.field_mapping === 'string'
      ? JSON.parse(config.field_mapping)
      : config.field_mapping;
    
    // Parse filters if they are strings
    const ghlFilters = typeof config.ghl_filters === 'string'
      ? JSON.parse(config.ghl_filters)
      : config.ghl_filters;
      
    const intakeqFilters = typeof config.intakeq_filters === 'string'
      ? JSON.parse(config.intakeq_filters)
      : config.intakeq_filters;

    // Show sync starting toast
    toast.info(`Starting synchronization: ${getDirectionMessage(syncDirection)}`);

    // Log sync attempt
    console.log('Starting sync with configuration:', {
      direction: syncDirection,
      fieldMapping,
      ghlFilters,
      intakeqFilters
    });

    // Get key fields for each data type
    const keyFields = getKeyFieldsByDataType(fieldMapping);
    console.log('Using key fields for matching:', keyFields);

    // Actual API calls to perform sync
    if (syncDirection === 'intakeq_to_ghl' || syncDirection === 'bidirectional') {
      await syncIntakeQToGoHighLevel(intakeqFilters, fieldMapping, keyFields);
    }
    
    if (syncDirection === 'ghl_to_intakeq' || syncDirection === 'bidirectional') {
      await syncGoHighLevelToIntakeQ(ghlFilters, fieldMapping, keyFields);
    }
    
    // Success toast
    toast.success("Synchronization completed successfully");
    
  } catch (error) {
    console.error('Sync error:', error);
    toast.error(`Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    
    // Log error activity
    await createSyncActivityLog({
      type: "Contact Sync",
      status: "error",
      detail: "Synchronization failed",
      error: error instanceof Error ? error.message : String(error),
      source: "System",
      destination: "System"
    });
  }
};

/**
 * Syncs contacts from IntakeQ to GoHighLevel
 */
async function syncIntakeQToGoHighLevel(
  filters: any, 
  fieldMapping: FieldMappingType,
  keyFields: Record<string, string>
) {
  // Get API keys
  const apiKeys = await getApiKeys();
  
  try {
    // 1. Fetch filtered clients from IntakeQ
    const clientsResponse = await fetchIntakeQClients(filters, apiKeys.intakeq_key);
    
    if (!clientsResponse || clientsResponse.length === 0) {
      toast.info("No matching IntakeQ clients found to sync");
      return;
    }
    
    console.log(`Found ${clientsResponse.length} IntakeQ clients to sync`);
    
    // 2. Process each contact
    for (const intakeQClient of clientsResponse) {
      try {
        // Focus on email as key field for contact matching
        const email = intakeQClient.Email;
        
        if (!email) {
          console.warn('Skipping IntakeQ client with no email:', intakeQClient);
          continue;
        }
        
        if (filters.clientIds && filters.clientIds.length > 0) {
          // If specific client filter is applied, only process matching clients
          if (!filters.clientIds.includes(intakeQClient.Email)) {
            continue;
          }
        }
        
        console.log(`Processing IntakeQ client: ${email}`);
        
        // 3. Map IntakeQ fields to GHL fields based on field mapping
        const contactData = mapIntakeQToGHL(intakeQClient, fieldMapping);
        
        // 4. Check if contact exists in GHL
        const ghlContact = await findGHLContactByEmail(email, apiKeys.ghl_key);
        
        if (ghlContact) {
          // Contact exists, update it
          await updateGHLContact(ghlContact.id, contactData, apiKeys.ghl_key);
          
          // Log successful update
          await createSyncActivityLog({
            type: "Contact Update",
            status: "success",
            detail: `Updated ${email} in GoHighLevel`,
            source: "IntakeQ",
            destination: "GoHighLevel",
            changes: [
              { field: "Email", oldValue: "", newValue: email },
              { field: "First Name", oldValue: "", newValue: contactData.firstName || "" },
              { field: "Last Name", oldValue: "", newValue: contactData.lastName || "" }
            ]
          });
        } else {
          // Contact doesn't exist, create it
          await createGHLContact(contactData, apiKeys.ghl_key);
          
          // Log successful creation
          await createSyncActivityLog({
            type: "Contact Creation",
            status: "success",
            detail: `Created new contact ${email} in GoHighLevel`,
            source: "IntakeQ",
            destination: "GoHighLevel",
            changes: [
              { field: "Email", oldValue: "", newValue: email },
              { field: "First Name", oldValue: "", newValue: contactData.firstName || "" },
              { field: "Last Name", oldValue: "", newValue: contactData.lastName || "" }
            ]
          });
        }
      } catch (contactError) {
        console.error(`Error processing contact ${intakeQClient.Email}:`, contactError);
        
        await createSyncActivityLog({
          type: "Contact Sync",
          status: "error",
          detail: `Failed to sync ${intakeQClient.Email}`,
          error: contactError instanceof Error ? contactError.message : String(contactError),
          source: "IntakeQ",
          destination: "GoHighLevel"
        });
      }
    }
  } catch (error) {
    console.error('Error in IntakeQ to GoHighLevel sync:', error);
    throw error;
  }
}

/**
 * Syncs contacts from GoHighLevel to IntakeQ
 */
async function syncGoHighLevelToIntakeQ(
  filters: any, 
  fieldMapping: FieldMappingType,
  keyFields: Record<string, string>
) {
  // Implementation for syncing from GHL to IntakeQ would go here
  // For brevity, focusing on the IntakeQ to GHL direction for now
  await createSyncActivityLog({
    type: "Contact Sync",
    status: "info",
    detail: "GHL to IntakeQ sync is not fully implemented yet",
    source: "GoHighLevel",
    destination: "IntakeQ"
  });
}

/**
 * Fetches clients from IntakeQ based on filters
 */
async function fetchIntakeQClients(filters: any, apiKey: string): Promise<any[]> {
  try {
    // Set up request to IntakeQ API
    const { data, error } = await supabase.functions.invoke('proxy', {
      body: {
        url: 'https://intakeq.com/api/v1/clients?limit=200',
        method: 'GET',
        headers: {
          'X-Auth-Key': apiKey,
          'Accept': 'application/json'
        }
      }
    });

    if (error || !data) {
      console.error('Error fetching IntakeQ clients:', error || 'No data returned');
      throw new Error(`Failed to fetch IntakeQ clients: ${error?.message || 'No data returned'}`);
    }

    console.log(`Fetched ${data.length} IntakeQ clients`);
    
    // If specific client ID filters are applied
    if (filters.clientIds && filters.clientIds.length > 0) {
      const filteredClients = data.filter((client: any) => 
        filters.clientIds.includes(client.Email)
      );
      
      console.log(`Filtered to ${filteredClients.length} clients based on email filters`);
      return filteredClients;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchIntakeQClients:', error);
    throw error;
  }
}

/**
 * Maps IntakeQ client data to GoHighLevel contact format
 */
function mapIntakeQToGHL(intakeQClient: any, fieldMapping: FieldMappingType): any {
  const ghlContact: any = {};
  
  // Map fields from IntakeQ to GHL based on fieldMapping
  const contactMapping = fieldMapping.contact;
  
  if (contactMapping && contactMapping.fields) {
    Object.entries(contactMapping.fields).forEach(([fieldName, settings]) => {
      if (settings.sync && (settings.direction === 'intakeq_to_ghl' || settings.direction === 'bidirectional')) {
        const intakeqFieldName = settings.intakeqField;
        const ghlFieldName = settings.ghlField;
        
        if (intakeqFieldName && ghlFieldName) {
          // Handle nested values in IntakeQ (e.g., custom.fieldName)
          if (intakeqFieldName.includes('.')) {
            const [parentField, childField] = intakeqFieldName.split('.');
            if (intakeQClient[parentField] && intakeQClient[parentField][childField]) {
              ghlContact[ghlFieldName] = intakeQClient[parentField][childField];
            }
          } else if (intakeQClient[intakeqFieldName]) {
            ghlContact[ghlFieldName] = intakeQClient[intakeqFieldName];
          }
        }
      }
    });
  }
  
  // Ensure base fields are mapped correctly
  if (intakeQClient.Email && !ghlContact.email) {
    ghlContact.email = intakeQClient.Email;
  }
  
  if (intakeQClient.Name) {
    // Extract first and last name if not already mapped
    if (!ghlContact.firstName || !ghlContact.lastName) {
      const nameParts = intakeQClient.Name.split(' ');
      if (nameParts.length > 0 && !ghlContact.firstName) {
        ghlContact.firstName = nameParts[0];
      }
      if (nameParts.length > 1 && !ghlContact.lastName) {
        ghlContact.lastName = nameParts.slice(1).join(' ');
      }
    }
  }
  
  if (intakeQClient.Phone && !ghlContact.phone) {
    ghlContact.phone = intakeQClient.Phone;
  }
  
  return ghlContact;
}

/**
 * Finds a contact in GoHighLevel by email
 */
async function findGHLContactByEmail(email: string, apiKey: string): Promise<any> {
  try {
    const LOCATION_ID = "GZecKV1IvZgcZdeVItxt"; // Using the location ID from ghlService.ts
    
    const { data, error } = await supabase.functions.invoke('proxy', {
      body: {
        url: `https://services.leadconnectorhq.com/contacts/search?locationId=${LOCATION_ID}&email=${encodeURIComponent(email)}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Accept': 'application/json'
        }
      }
    });

    if (error) {
      console.error('Error searching GoHighLevel contacts:', error);
      throw new Error(`Failed to search GoHighLevel contacts: ${error.message}`);
    }

    if (!data || !data.contacts || data.contacts.length === 0) {
      console.log(`No matching contact found in GoHighLevel for email: ${email}`);
      return null;
    }

    console.log(`Found existing contact in GoHighLevel for email: ${email}`);
    return data.contacts[0];
  } catch (error) {
    console.error(`Error in findGHLContactByEmail for ${email}:`, error);
    throw error;
  }
}

/**
 * Creates a new contact in GoHighLevel
 */
async function createGHLContact(contactData: any, apiKey: string): Promise<any> {
  try {
    const LOCATION_ID = "GZecKV1IvZgcZdeVItxt"; // Using the location ID from ghlService.ts
    
    console.log('Creating new contact in GoHighLevel:', contactData);
    
    const { data, error } = await supabase.functions.invoke('proxy', {
      body: {
        url: `https://services.leadconnectorhq.com/contacts/?locationId=${LOCATION_ID}`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data: contactData
      }
    });

    if (error || (data && data._statusCode >= 400)) {
      console.error('Error creating GoHighLevel contact:', error || data);
      throw new Error(`Failed to create GoHighLevel contact: ${
        error?.message || data?._errorMessage || 'Unknown error'
      }`);
    }

    console.log('Successfully created contact in GoHighLevel:', data);
    return data;
  } catch (error) {
    console.error('Error in createGHLContact:', error);
    throw error;
  }
}

/**
 * Updates an existing contact in GoHighLevel
 */
async function updateGHLContact(contactId: string, contactData: any, apiKey: string): Promise<any> {
  try {
    const LOCATION_ID = "GZecKV1IvZgcZdeVItxt"; // Using the location ID from ghlService.ts
    
    console.log(`Updating GoHighLevel contact ${contactId}:`, contactData);
    
    const { data, error } = await supabase.functions.invoke('proxy', {
      body: {
        url: `https://services.leadconnectorhq.com/contacts/${contactId}?locationId=${LOCATION_ID}`,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data: contactData
      }
    });

    if (error || (data && data._statusCode >= 400)) {
      console.error('Error updating GoHighLevel contact:', error || data);
      throw new Error(`Failed to update GoHighLevel contact: ${
        error?.message || data?._errorMessage || 'Unknown error'
      }`);
    }

    console.log('Successfully updated contact in GoHighLevel:', data);
    return data;
  } catch (error) {
    console.error('Error in updateGHLContact:', error);
    throw error;
  }
}

/**
 * Helper function to get a user-friendly message for sync direction
 */
const getDirectionMessage = (direction: string): string => {
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
const getKeyFieldsByDataType = (fieldMapping: FieldMappingType): Record<string, string> => {
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
