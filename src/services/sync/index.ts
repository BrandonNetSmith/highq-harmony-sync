
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
  console.log('=== SYNC PROCESS STARTED ===');
  
  try {
    console.log('Step 1: Getting sync configuration...');
    
    // Get current sync configuration
    const config = await getSyncConfig();
    
    if (!config) {
      console.error('ERROR: Sync configuration not found');
      toast.error("Sync configuration not found. Please configure your sync settings first.");
      
      // Log the error
      await createSyncActivityLog({
        type: "Contact Sync",
        status: "error",
        detail: "Sync configuration not found",
        error: "Missing sync configuration - please configure sync settings first",
        source: "System",
        destination: "System"
      });
      
      return;
    }

    console.log('Step 2: Configuration retrieved successfully');
    console.log('Config data:', JSON.stringify(config, null, 2));

    // Get API keys
    console.log('Step 3: Getting API keys...');
    const apiKeys = await getApiKeys();
    console.log('API keys status:', apiKeys ? 'Keys found' : 'Keys missing');
    
    if (!apiKeys?.ghl_key || !apiKeys?.intakeq_key) {
      console.error('ERROR: API keys not configured');
      console.log('GHL Key present:', !!apiKeys?.ghl_key);
      console.log('IntakeQ Key present:', !!apiKeys?.intakeq_key);
      
      const missingKeys = [];
      if (!apiKeys?.ghl_key) missingKeys.push("GoHighLevel");
      if (!apiKeys?.intakeq_key) missingKeys.push("IntakeQ");
      
      toast.error(`Missing API keys for: ${missingKeys.join(", ")}. Please configure your API keys first.`);
      
      // Log the error
      await createSyncActivityLog({
        type: "Contact Sync",
        status: "error",
        detail: `Missing API keys for: ${missingKeys.join(", ")}`,
        error: "API keys not configured - please set up API keys first",
        source: "System",
        destination: "System"
      });
      
      return;
    }

    // If no direction provided, use the one from config
    let syncDirection = direction;
    
    // Map the database enum values to our internal values
    if (!syncDirection) {
      syncDirection = mapDatabaseSyncDirection(config.sync_direction);
    }
    
    console.log('Step 4: Using sync direction:', syncDirection);
    
    // Parse field mapping if it's a string
    let fieldMapping: FieldMappingType;
    try {
      fieldMapping = typeof config.field_mapping === 'string'
        ? JSON.parse(config.field_mapping)
        : config.field_mapping;
        
      if (!fieldMapping || typeof fieldMapping !== 'object') {
        throw new Error('Invalid field mapping structure');
      }
    } catch (error) {
      console.error('Error parsing field mapping:', error);
      toast.error("Invalid field mapping configuration. Please check your field mapping settings.");
      
      await createSyncActivityLog({
        type: "Contact Sync",
        status: "error",
        detail: "Invalid field mapping configuration",
        error: "Field mapping could not be parsed - please check configuration",
        source: "System",
        destination: "System"
      });
      
      return;
    }
    
    console.log('Step 5: Field mapping processed:', JSON.stringify(fieldMapping, null, 2));
    
    // Parse filters if they are strings
    const ghlFilters = typeof config.ghl_filters === 'string'
      ? JSON.parse(config.ghl_filters)
      : config.ghl_filters;
      
    const intakeqFilters = typeof config.intakeq_filters === 'string'
      ? JSON.parse(config.intakeq_filters)
      : config.intakeq_filters;

    console.log('Step 6: Filters processed');
    console.log('GHL Filters:', ghlFilters);
    console.log('IntakeQ Filters:', intakeqFilters);

    // Show sync starting toast
    console.log('Step 7: Starting sync notification');
    toast.info(`Starting synchronization: ${getDirectionMessage(syncDirection)}`);

    // Create a sync activity log for the start of the sync
    console.log('Step 8: Creating initial sync log');
    await createSyncActivityLog({
      type: "Contact Sync",
      status: "pending",
      detail: `Starting ${getDirectionMessage(syncDirection)} synchronization`,
      source: syncDirection === 'ghl_to_intakeq' ? "GoHighLevel" : "IntakeQ",
      destination: syncDirection === 'ghl_to_intakeq' ? "IntakeQ" : "GoHighLevel"
    });

    // Get key fields for each data type
    const keyFields = getKeyFieldsByDataType(fieldMapping);
    console.log('Step 9: Key fields identified:', keyFields);

    // Actual API calls to perform sync
    console.log('Step 10: Executing sync operations...');
    
    let hasErrors = false;
    
    if (syncDirection === 'intakeq_to_ghl' || syncDirection === 'bidirectional') {
      try {
        console.log('Executing IntakeQ to GoHighLevel sync...');
        await syncIntakeQToGoHighLevel(intakeqFilters, fieldMapping, keyFields, apiKeys.intakeq_key, apiKeys.ghl_key);
      } catch (error) {
        console.error('IntakeQ to GHL sync failed:', error);
        hasErrors = true;
        
        await createSyncActivityLog({
          type: "Contact Sync",
          status: "error",
          detail: "IntakeQ to GoHighLevel sync failed",
          error: error instanceof Error ? error.message : String(error),
          source: "IntakeQ",
          destination: "GoHighLevel"
        });
      }
    }
    
    if (syncDirection === 'ghl_to_intakeq' || syncDirection === 'bidirectional') {
      try {
        console.log('Executing GoHighLevel to IntakeQ sync...');
        await syncGoHighLevelToIntakeQ(ghlFilters, fieldMapping, keyFields, apiKeys.ghl_key, apiKeys.intakeq_key);
      } catch (error) {
        console.error('GHL to IntakeQ sync failed:', error);
        hasErrors = true;
        
        await createSyncActivityLog({
          type: "Contact Sync",
          status: "error",
          detail: "GoHighLevel to IntakeQ sync failed",
          error: error instanceof Error ? error.message : String(error),
          source: "GoHighLevel",
          destination: "IntakeQ"
        });
      }
    }
    
    // Success or partial success toast
    console.log('Step 11: Sync completed');
    if (hasErrors) {
      toast.warning("Synchronization completed with some errors. Check activity logs for details.");
    } else {
      toast.success("Synchronization completed successfully");
    }
    
    // Log final completion status
    await createSyncActivityLog({
      type: "Contact Sync",
      status: hasErrors ? "error" : "success",
      detail: hasErrors 
        ? `Completed ${getDirectionMessage(syncDirection)} synchronization with errors`
        : `Completed ${getDirectionMessage(syncDirection)} synchronization successfully`,
      source: syncDirection === 'ghl_to_intakeq' ? "GoHighLevel" : "IntakeQ",
      destination: syncDirection === 'ghl_to_intakeq' ? "IntakeQ" : "GoHighLevel"
    });
    
    console.log('=== SYNC PROCESS COMPLETED ===');
    
  } catch (error) {
    console.error('=== SYNC PROCESS FAILED ===');
    console.error('Sync error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    toast.error(`Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    
    // Log error activity
    await createSyncActivityLog({
      type: "Contact Sync",
      status: "error",
      detail: "Synchronization failed with critical error",
      error: error instanceof Error ? error.message : String(error),
      source: "System",
      destination: "System"
    });
  }
};
