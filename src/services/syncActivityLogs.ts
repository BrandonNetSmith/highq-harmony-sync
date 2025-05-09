import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { SyncActivityLog } from "@/components/SyncActivityLogModal";

/**
 * Fetches sync activity logs from the database
 * @returns Array of sync activity logs
 */
export const getSyncActivityLogs = async (): Promise<SyncActivityLog[]> => {
  try {
    // Check if we have a logs table in our database
    // If not, return mock data for demo purposes
    const { data: tableExists } = await supabase
      .from('sync_activity_logs')
      .select('id')
      .limit(1);

    if (!tableExists) {
      console.log('Sync logs table not found, returning mock data');
      return getMockSyncActivityLogs();
    }

    const { data, error } = await supabase
      .from('sync_activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase error fetching logs:', error);
      toast.error(`Failed to retrieve sync logs: ${error.message}`);
      // Fall back to mock data if there's an error
      return getMockSyncActivityLogs();
    }

    return data || [];
  } catch (error) {
    console.error('Error getting sync activity logs:', error);
    toast.error(`Error fetching sync activity logs: ${error instanceof Error ? error.message : String(error)}`);
    // Fall back to mock data if there's an exception
    return getMockSyncActivityLogs();
  }
};

/**
 * Creates a new sync activity log in the database
 * @param log The log data to create
 */
export const createSyncActivityLog = async (log: Omit<SyncActivityLog, 'id' | 'timestamp'>): Promise<void> => {
  try {
    // Check if we have a logs table in our database
    // If not, just log to console for demo purposes
    const { data: tableExists } = await supabase
      .from('sync_activity_logs')
      .select('id')
      .limit(1);

    if (!tableExists) {
      console.log('Sync log table not found, logging to console instead:', log);
      return;
    }

    const { error } = await supabase
      .from('sync_activity_logs')
      .insert([{
        ...log,
        // The database will handle id and timestamp automatically
      }]);

    if (error) {
      console.error('Failed to save sync log:', error);
      toast.error(`Failed to record sync activity: ${error.message}`);
    }
  } catch (error) {
    console.error('Error creating sync log:', error);
  }
};

/**
 * Fetches a specific sync activity log by ID
 * @param id The ID of the log to fetch
 * @returns The sync activity log
 */
export const getSyncActivityLogById = async (id: number): Promise<SyncActivityLog | null> => {
  try {
    // Check if we have a logs table in our database
    const { data: tableExists } = await supabase
      .from('sync_activity_logs')
      .select('id')
      .limit(1);

    if (!tableExists) {
      // Return mock log for demo purposes
      const logs = getMockSyncActivityLogs();
      return logs.find(log => log.id === id) || null;
    }

    const { data, error } = await supabase
      .from('sync_activity_logs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`Error getting sync activity log with ID ${id}:`, error);
      toast.error(`Error fetching sync log details: ${error.message}`);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error getting sync activity log with ID ${id}:`, error);
    toast.error(`Error fetching sync log details: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

/**
 * Provides mock data for sync activity logs
 * Note: This is used when the database table doesn't exist yet
 * @returns Array of mock sync activity logs
 */
const getMockSyncActivityLogs = (): SyncActivityLog[] => {
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
};
