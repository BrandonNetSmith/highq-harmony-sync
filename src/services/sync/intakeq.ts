import { supabase } from "@/integrations/supabase/client";
import { createSyncActivityLog } from "../syncActivityLogs";
import { ContactData, SyncDirection } from "./types";
import { FieldMappingType } from "@/types/field-mapping";
import { toast } from "sonner";
import { findGHLContactByEmail, createGHLContact, updateGHLContact } from "./ghl";

/**
 * Fetches clients from IntakeQ based on filters
 */
export async function fetchIntakeQClients(filters: any, apiKey: string): Promise<any[]> {
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
export function mapIntakeQToGHL(intakeQClient: any, fieldMapping: FieldMappingType): ContactData {
  const ghlContact: ContactData = {
    email: intakeQClient.Email // Always ensure email is mapped
  };
  
  // Map fields from IntakeQ to GHL based on fieldMapping
  const contactMapping = fieldMapping.contact;
  
  if (contactMapping && contactMapping.fields) {
    Object.entries(contactMapping.fields).forEach(([fieldName, settings]) => {
      if (settings.sync && (settings.direction === 'one_way_intakeq_to_ghl' || settings.direction === 'bidirectional')) {
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
 * Syncs contacts from IntakeQ to GoHighLevel
 */
export async function syncIntakeQToGoHighLevel(
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
