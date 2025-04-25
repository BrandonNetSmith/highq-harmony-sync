
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import type { SyncActivityLog } from "@/components/SyncActivityLogModal";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];
export type SyncConfig = Database["public"]["Tables"]["sync_config"]["Row"];

export type FieldMappingType = {
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

/**
 * Saves sync configuration to the database
 * @param config The sync configuration to save
 * @returns Promise that resolves when the save is complete
 */
export const saveSyncConfig = async (config: Partial<SyncConfig>) => {
  try {
    // First, check if there's an existing config to get the ID
    if (!config.id) {
      const { data: existingConfig, error: fetchError } = await supabase
        .from('sync_config')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching existing config:', fetchError);
        toast.error(`Failed to fetch existing sync configuration: ${fetchError.message}`);
        throw new Error(`Failed to fetch existing sync configuration: ${fetchError.message}`);
      }
      
      if (existingConfig) {
        config.id = existingConfig.id;
      } else {
        // If no config exists yet, create one with a UUID
        config.id = crypto.randomUUID();
      }
    }
    
    // Make sure to stringify JSON fields if they aren't strings already
    const field_mapping = typeof config.field_mapping === 'object' && config.field_mapping !== null
      ? JSON.stringify(config.field_mapping)
      : config.field_mapping;
      
    const ghl_filters = typeof config.ghl_filters === 'object' && config.ghl_filters !== null
      ? JSON.stringify(config.ghl_filters)
      : config.ghl_filters;
      
    const intakeq_filters = typeof config.intakeq_filters === 'object' && config.intakeq_filters !== null
      ? JSON.stringify(config.intakeq_filters)
      : config.intakeq_filters;
    
    // Construct the record to be saved
    const recordToSave: any = {
      id: config.id
    };
    
    // Only include fields that are provided in the config
    if (config.sync_direction !== undefined) {
      recordToSave.sync_direction = config.sync_direction;
    }
    
    if (ghl_filters !== undefined) {
      recordToSave.ghl_filters = ghl_filters;
    }
    
    if (intakeq_filters !== undefined) {
      recordToSave.intakeq_filters = intakeq_filters;
    }
    
    if (config.is_sync_enabled !== undefined) {
      recordToSave.is_sync_enabled = config.is_sync_enabled;
    }
    
    if (field_mapping !== undefined) {
      recordToSave.field_mapping = field_mapping;
    }
    
    const { error } = await supabase
      .from('sync_config')
      .upsert([recordToSave]);

    if (error) {
      console.error('Supabase error:', error);
      toast.error(`Failed to save sync configuration: ${error.message}`);
      throw new Error(`Failed to save sync configuration: ${error.message}`);
    }

    toast.success("Sync configuration saved successfully");
  } catch (error) {
    console.error('Error saving sync config:', error);
    toast.error(`Error saving sync config: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

/**
 * Retrieves the sync configuration from the database
 * @returns The sync configuration object
 */
export const getSyncConfig = async (): Promise<SyncConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('sync_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      toast.error(`Failed to retrieve sync configuration: ${error.message}`);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting sync config:', error);
    toast.error(`Error getting sync config: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

/**
 * Fetches sync activity logs
 * Note: This is currently using mock data. In a real implementation,
 * this would fetch from a database table or external API.
 * @returns Array of sync activity logs
 */
export const getSyncActivityLogs = async (): Promise<SyncActivityLog[]> => {
  // In a real implementation, this would fetch from the database
  // For now, we'll return mock data
  try {
    // Simulated API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in a real implementation, this would be fetched from the database
    return [
      {
        id: 1,
        timestamp: "2024-04-24 10:30:15",
        type: "Contact Sync",
        status: "success",
        detail: "Contact John Doe synced successfully",
        source: "GoHighLevel",
        destination: "IntakeQ",
        changes: [
          { field: "Email", oldValue: "john.doe@old.com", newValue: "john.doe@new.com" },
          { field: "Phone", oldValue: "123-456-7890", newValue: "987-654-3210" },
          { field: "Address", oldValue: "123 Old St", newValue: "456 New Ave" }
        ]
      },
      {
        id: 2,
        timestamp: "2024-04-24 10:29:00",
        type: "Form Submission",
        status: "success",
        detail: "New intake form processed",
        source: "IntakeQ",
        destination: "GoHighLevel",
        changes: [
          { field: "Form Status", oldValue: "Draft", newValue: "Submitted" },
          { field: "Submission Date", oldValue: "", newValue: "2024-04-24" }
        ]
      },
      {
        id: 3,
        timestamp: "2024-04-24 10:25:30",
        type: "Contact Update",
        status: "error",
        detail: "Failed to update contact details",
        source: "GoHighLevel",
        destination: "IntakeQ",
        error: "API connection timeout after 30 seconds"
      },
      {
        id: 4,
        timestamp: "2024-04-24 10:15:22",
        type: "Appointment Sync",
        status: "success",
        detail: "Appointment for John Doe on April 25 synced",
        source: "IntakeQ",
        destination: "GoHighLevel",
        changes: [
          { field: "Date", oldValue: "2024-04-24", newValue: "2024-04-25" },
          { field: "Time", oldValue: "10:00 AM", newValue: "2:00 PM" },
          { field: "Notes", oldValue: "Initial consultation", newValue: "Follow-up consultation" }
        ]
      },
      {
        id: 5,
        timestamp: "2024-04-24 09:45:12",
        type: "Form Update",
        status: "pending",
        detail: "Intake form update in progress",
        source: "GoHighLevel",
        destination: "IntakeQ"
      }
    ];
  } catch (error) {
    console.error('Error getting sync activity logs:', error);
    toast.error(`Error fetching sync activity logs: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

/**
 * Fetches a specific sync activity log by ID
 * @param id The ID of the log to fetch
 * @returns The sync activity log
 */
export const getSyncActivityLogById = async (id: number): Promise<SyncActivityLog | null> => {
  try {
    // In a real implementation, this would fetch from the database
    const logs = await getSyncActivityLogs();
    return logs.find(log => log.id === id) || null;
  } catch (error) {
    console.error(`Error getting sync activity log with ID ${id}:`, error);
    toast.error(`Error fetching sync log details: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};
