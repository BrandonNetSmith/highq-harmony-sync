
import { toast } from "sonner";
import type { SyncActivityLog } from "@/components/SyncActivityLogModal";

// Mock data for activity logs - this would ideally be persisted to a database table
let mockLogs: SyncActivityLog[] = getMockSyncActivityLogs();

/**
 * Fetches sync activity logs from the database
 * @returns Array of sync activity logs
 */
export const getSyncActivityLogs = async (): Promise<SyncActivityLog[]> => {
  try {
    // Since we don't have a sync_activity_logs table in the database,
    // we'll return the in-memory mock data
    return [...mockLogs]; // Return a copy to avoid direct modification
  } catch (error) {
    console.error('Error getting sync activity logs:', error);
    toast.error(`Error fetching sync activity logs: ${error instanceof Error ? error.message : String(error)}`);
    return [...mockLogs]; // Return a copy of mock data as fallback
  }
};

/**
 * Creates a new sync activity log entry
 * @param log The log data to create
 */
export const createSyncActivityLog = async (log: Omit<SyncActivityLog, 'id' | 'timestamp'>): Promise<void> => {
  try {
    // Create a new log with timestamp and ID
    const newLog: SyncActivityLog = {
      id: mockLogs.length + 1,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...log
    };
    
    // Add to mock logs
    mockLogs = [newLog, ...mockLogs].slice(0, 100); // Keep only the most recent 100 logs
    
    console.log('Created new sync activity log:', newLog);
    return;
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
    // Return mock log for demo purposes
    return mockLogs.find(log => log.id === id) || null;
  } catch (error) {
    console.error(`Error getting sync activity log with ID ${id}:`, error);
    toast.error(`Error fetching sync log details: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

/**
 * Provides mock data for sync activity logs
 * @returns Array of mock sync activity logs
 */
function getMockSyncActivityLogs(): SyncActivityLog[] {
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
}
