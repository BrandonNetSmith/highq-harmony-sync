
import { toast } from "sonner";
import { createSyncActivityLog } from "../syncActivityLogs";
import { getSyncConfig } from "../syncConfig";
import { getApiKeys } from "../apiKeys";
import type { FieldMappingType } from "@/types/field-mapping";
import { getDirectionMessage, getKeyFieldsByDataType, mapDatabaseSyncDirection } from "./helpers";
import { syncIntakeQToGoHighLevel } from "./intakeq";
import { syncGoHighLevelToIntakeQ } from "./ghl";
import { SyncDirection } from "./types";

/**
 * Initiates a synchronization between GoHighLevel and IntakeQ
 * @param direction Optional override for the sync direction
 */
export const performSync = async (
  direction?: SyncDirection
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
      syncDirection = mapDatabaseSyncDirection(config.sync_direction);
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
