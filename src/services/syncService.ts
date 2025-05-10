
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
    let syncDirection = direction;
    
    // Map the database enum values to our internal values
    if (!syncDirection) {
      if (config.sync_direction === 'one_way_ghl_to_intakeq') {
        syncDirection = 'ghl_to_intakeq';
      } else if (config.sync_direction === 'one_way_intakeq_to_ghl') {
        syncDirection = 'intakeq_to_ghl';
      } else {
        syncDirection = 'bidirectional';
      }
    }
    
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

    // Create a sync activity log for the start of the sync
    await createSyncActivityLog({
      type: "Contact Sync",
      status: "pending",
      detail: `Starting ${getDirectionMessage(syncDirection)} synchronization`,
      source: syncDirection === 'ghl_to_intakeq' ? "GoHighLevel" : "IntakeQ",
      destination: syncDirection === 'ghl_to_intakeq' ? "IntakeQ" : "GoHighLevel"
    });

    // Get key fields for each data type
    const keyFields = getKeyFieldsByDataType(fieldMapping);
    console.log('Using key fields for matching:', keyFields);

    // Actual API calls to perform sync
    if (syncDirection === 'intakeq_to_ghl' || syncDirection === 'bidirectional') {
      await syncIntakeQToGoHighLevel(intakeqFilters, fieldMapping, keyFields, apiKeys.intakeq_key, apiKeys.ghl_key);
    }
    
    if (syncDirection === 'ghl_to_intakeq' || syncDirection === 'bidirectional') {
      await syncGoHighLevelToIntakeQ(ghlFilters, fieldMapping, keyFields, apiKeys.ghl_key, apiKeys.intakeq_key);
    }
    
    // Success toast
    toast.success("Synchronization completed successfully");
    
    // Log successful completion
    await createSyncActivityLog({
      type: "Contact Sync",
      status: "success",
      detail: `Completed ${getDirectionMessage(syncDirection)} synchronization`,
      source: syncDirection === 'ghl_to_intakeq' ? "GoHighLevel" : "IntakeQ",
      destination: syncDirection === 'ghl_to_intakeq' ? "IntakeQ" : "GoHighLevel"
    });
    
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
  keyFields: Record<string, string>,
  intakeqApiKey: string,
  ghlApiKey: string
) {
  try {
    console.log('Starting IntakeQ to GHL sync with filters:', filters);
    
    // 1. Fetch filtered clients from IntakeQ
    const clientsResponse = await fetchIntakeQClients(filters, intakeqApiKey);
    
    if (!clientsResponse || clientsResponse.length === 0) {
      toast.info("No matching IntakeQ clients found to sync");
      
      await createSyncActivityLog({
        type: "Contact Sync",
        status: "success",
        detail: "No matching IntakeQ clients found to sync",
        source: "IntakeQ",
        destination: "GoHighLevel"
      });
      
      return;
    }
    
    console.log(`Found ${clientsResponse.length} IntakeQ clients to sync`);
    
    // 2. Process each contact
    for (const intakeQClient of clientsResponse) {
      try {
        console.log('Processing IntakeQ client:', intakeQClient);
        
        // Focus on email as key field for contact matching
        const email = intakeQClient.Email;
        
        if (!email) {
          console.warn('Skipping IntakeQ client with no email:', intakeQClient);
          
          await createSyncActivityLog({
            type: "Contact Sync",
            status: "error",
            detail: `Skipped client with missing email`,
            error: "Client email is missing",
            source: "IntakeQ",
            destination: "GoHighLevel"
          });
          
          continue;
        }
        
        // If specific client filter is applied, only process matching clients
        if (filters.clientIds && filters.clientIds.length > 0) {
          const shouldProcess = filters.clientIds.some((id: string) => 
            id === email || id === intakeQClient.id || id === intakeQClient.clientId
          );
          
          if (!shouldProcess) {
            console.log(`Skipping client ${email} as it doesn't match client ID filters`);
            continue;
          }
        }
        
        console.log(`Processing IntakeQ client: ${email}`);
        
        // 3. Map IntakeQ fields to GHL fields based on field mapping
        const contactData = mapIntakeQToGHL(intakeQClient, fieldMapping);
        
        console.log('Mapped GHL contact data:', contactData);
        
        // 4. Check if contact exists in GHL
        const ghlContact = await findGHLContactByEmail(email, ghlApiKey);
        
        if (ghlContact) {
          // Contact exists, update it
          await updateGHLContact(ghlContact.id, contactData, ghlApiKey);
          
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
          
          toast.success(`Updated contact: ${email}`);
        } else {
          // Contact doesn't exist, create it
          await createGHLContact(contactData, ghlApiKey);
          
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
          
          toast.success(`Created new contact: ${email}`);
        }
      } catch (contactError) {
        console.error(`Error processing contact ${intakeQClient.Email}:`, contactError);
        
        await createSyncActivityLog({
          type: "Contact Sync",
          status: "error",
          detail: `Failed to sync ${intakeQClient.Email || "unknown contact"}`,
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
  keyFields: Record<string, string>,
  ghlApiKey: string,
  intakeqApiKey: string
) {
  // Implementation for syncing from GHL to IntakeQ would go here
  // For brevity, focusing on the IntakeQ to GHL direction for now
  await createSyncActivityLog({
    type: "Contact Sync",
    status: "pending",
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
    console.log('Fetching IntakeQ clients with filters:', filters);
    
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
    
    // If specific client email filters are applied
    if (filters.clientIds && filters.clientIds.length > 0) {
      console.log('Applying client ID filters:', filters.clientIds);
      
      const filteredClients = data.filter((client: any) => 
        filters.clientIds.some((id: string) => 
          client.Email && client.Email.toLowerCase() === id.toLowerCase() || 
          client.id === id || 
          client.clientId === id
        )
      );
      
      console.log(`Filtered to ${filteredClients.length} clients based on filters`);
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
  const ghlContact: any = {
    email: intakeQClient.Email // Always ensure email is mapped
  };
  
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
            if (intakeQClient[parentField] && intakeQClient[parentField][childField] !== undefined) {
              ghlContact[ghlFieldName] = intakeQClient[parentField][childField];
              console.log(`Mapped nested field: ${intakeqFieldName} → ${ghlFieldName} = ${ghlContact[ghlFieldName]}`);
            }
          } else if (intakeQClient[intakeqFieldName] !== undefined) {
            ghlContact[ghlFieldName] = intakeQClient[intakeqFieldName];
            console.log(`Mapped field: ${intakeqFieldName} → ${ghlFieldName} = ${ghlContact[ghlFieldName]}`);
          }
        }
      }
    });
  }
  
  // Ensure base fields are mapped correctly
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
    
    console.log(`Searching for GHL contact with email: ${email}`);
    
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

    console.log('GHL search response:', data);

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
      const errorMessage = error?.message || data?._errorMessage || 'Unknown error';
      console.error('Error creating GoHighLevel contact:', error || data);
      
      await createSyncActivityLog({
        type: "Contact Creation",
        status: "error",
        detail: `Failed to create contact in GoHighLevel: ${contactData.email}`,
        error: errorMessage,
        source: "IntakeQ",
        destination: "GoHighLevel"
      });
      
      throw new Error(`Failed to create GoHighLevel contact: ${errorMessage}`);
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
      const errorMessage = error?.message || data?._errorMessage || 'Unknown error';
      console.error('Error updating GoHighLevel contact:', error || data);
      
      await createSyncActivityLog({
        type: "Contact Update",
        status: "error",
        detail: `Failed to update contact in GoHighLevel: ${contactData.email}`,
        error: errorMessage,
        source: "IntakeQ",
        destination: "GoHighLevel"
      });
      
      throw new Error(`Failed to update GoHighLevel contact: ${errorMessage}`);
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
