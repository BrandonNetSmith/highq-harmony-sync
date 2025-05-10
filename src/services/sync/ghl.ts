
import { supabase } from "@/integrations/supabase/client";
import { createSyncActivityLog } from "../syncActivityLogs";
import { ContactData } from "./types";
import { FieldMappingType } from "@/types/field-mapping";

// Using the location ID from ghlService.ts
const LOCATION_ID = "GZecKV1IvZgcZdeVItxt";

/**
 * Finds a contact in GoHighLevel by email
 */
export async function findGHLContactByEmail(email: string, apiKey: string): Promise<any> {
  try {
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
export async function createGHLContact(contactData: ContactData, apiKey: string): Promise<any> {
  try {
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
export async function updateGHLContact(contactId: string, contactData: ContactData, apiKey: string): Promise<any> {
  try {
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
 * Syncs contacts from GoHighLevel to IntakeQ
 */
export async function syncGoHighLevelToIntakeQ(
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
