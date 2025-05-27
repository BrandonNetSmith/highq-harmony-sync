import { toast } from "sonner";
import type { SyncActivityLog } from "@/components/SyncActivityLogModal";

// Mock data for activity logs - this would ideally be persisted to a database table
let mockLogs: SyncActivityLog[] = [];

/**
 * Fetches sync activity logs from the database
 * @returns Array of sync activity logs
 */
export const getSyncActivityLogs = async (): Promise<SyncActivityLog[]> => {
  try {
    console.log('Fetching sync activity logs...');
    console.log('Current logs count:', mockLogs.length);
    
    // Since we don't have a sync_activity_logs table in the database,
    // we'll return the in-memory mock data
    return [...mockLogs].sort((a, b) => b.id - a.id); // Return newest first
  } catch (error) {
    console.error('Error getting sync activity logs:', error);
    toast.error(`Error fetching sync activity logs: ${error instanceof Error ? error.message : String(error)}`);
    return [];
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
      id: Date.now(), // Use timestamp as unique ID
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...log
    };
    
    console.log('Creating new sync activity log:', newLog);
    
    // Add to mock logs (keep only the most recent 50 logs)
    mockLogs = [newLog, ...mockLogs].slice(0, 50);
    
    console.log('Log created successfully. Total logs:', mockLogs.length);
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
    const log = mockLogs.find(log => log.id === id) || null;
    console.log(`Fetching log with ID ${id}:`, log ? 'Found' : 'Not found');
    return log;
  } catch (error) {
    console.error(`Error getting sync activity log with ID ${id}:`, error);
    toast.error(`Error fetching sync log details: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};
