
import { toast } from "sonner";
import type { SyncActivityLog } from "@/components/SyncActivityLogModal";

/**
 * Fetches sync activity logs
 * Note: This is currently using mock data. In a real implementation,
 * this would fetch from a database table or external API.
 * @returns Array of sync activity logs
 */
export const getSyncActivityLogs = async (): Promise<SyncActivityLog[]> => {
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
