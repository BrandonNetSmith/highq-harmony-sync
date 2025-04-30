
import { getApiKeys } from "@/services/apiKeys";
import { supabase } from "@/integrations/supabase/client";

export const fetchIntakeQData = async (dataType?: 'client' | 'form' | 'appointment') => {
  try {
    const { intakeq_key } = await getApiKeys();
    
    if (!intakeq_key) {
      return {
        forms: [],
        clients: [],
        error: "Please set your IntakeQ API key first",
        debugInfo: null
      };
    }

    console.log("Using IntakeQ API key:", intakeq_key ? "Key found" : "No key");
    
    // Define the API endpoints to try based on dataType
    let formsData = [];
    let clientsData = [];
    let formsError = null;
    let clientsError = null;
    let debugInfo = null;
    
    // Only fetch forms if requested or if no specific dataType was provided
    if (!dataType || dataType === 'form') {
      // IntakeQ API endpoints - try different formats if one fails
      const formApiFormats = [
        'https://intakeq.com/api/v1/forms',
        'https://intakeq.com/v1/forms',
        'https://intakeq.com/api/forms'
      ];
      
      // Try each API format until one works
      for (const apiUrl of formApiFormats) {
        console.log(`Attempting to fetch forms from: ${apiUrl}`);
        
        const result = await supabase.functions.invoke('proxy', {
          body: {
            url: `${apiUrl}?limit=20`,
            method: 'GET',
            headers: {
              'X-Auth-Key': intakeq_key,
              'Accept': 'application/json'
            }
          }
        });
        
        if (!result.error && !result.data?._error && !result.data?._statusCode || 
            (result.data?._statusCode && result.data._statusCode < 400)) {
          formsData = result.data;
          console.log(`Success with API endpoint: ${apiUrl}`);
          break;
        } else {
          console.log(`Failed with API endpoint: ${apiUrl}`, result.data?._statusCode || result.error);
          formsError = result.error || {
            message: result.data?._errorMessage || `Failed with ${apiUrl}`
          };
          debugInfo = {
            statusCode: result.data?._statusCode,
            contentType: result.data?._contentType,
            isHtml: !!result.data?._isHtml,
            hasParseError: !!result.data?._parseError,
            requestUrl: apiUrl,
            errorMessage: result.data?._errorMessage || null
          };
        }
      }
    }
    
    // Only fetch clients if requested or if no specific dataType was provided
    if (!dataType || dataType === 'client') {
      const clientApiFormats = [
        'https://intakeq.com/api/v1/clients',
        'https://intakeq.com/v1/clients',
        'https://intakeq.com/api/clients'
      ];
      
      // Try each API format for clients until one works
      for (const apiUrl of clientApiFormats) {
        console.log(`Attempting to fetch clients from: ${apiUrl}`);
        
        const result = await supabase.functions.invoke('proxy', {
          body: {
            url: `${apiUrl}?limit=20`,
            method: 'GET',
            headers: {
              'X-Auth-Key': intakeq_key,
              'Accept': 'application/json'
            }
          }
        });
        
        if (!result.error && !result.data?._error && !result.data?._statusCode || 
            (result.data?._statusCode && result.data._statusCode < 400)) {
          clientsData = result.data;
          console.log(`Success with API endpoint: ${apiUrl}`);
          break;
        } else {
          console.log(`Failed with API endpoint: ${apiUrl}`, result.data?._statusCode || result.error);
          clientsError = result.error || {
            message: result.data?._errorMessage || `Failed with ${apiUrl}`
          };
          // Only set debug info if we don't have it yet
          if (!debugInfo) {
            debugInfo = {
              statusCode: result.data?._statusCode,
              contentType: result.data?._contentType,
              isHtml: !!result.data?._isHtml,
              hasParseError: !!result.data?._parseError,
              requestUrl: apiUrl,
              errorMessage: result.data?._errorMessage || null
            };
          }
        }
      }
    }
    
    // Handle errors based on the requested data type
    if (dataType === 'form' && formsError) {
      console.error('IntakeQ Forms API error:', formsError);
      return {
        forms: [],
        clients: [],
        error: `Failed to fetch forms: ${formsError.message}`,
        debugInfo
      };
    }
    
    if (dataType === 'client' && clientsError) {
      console.error('IntakeQ Clients API error:', clientsError);
      return {
        forms: [],
        clients: [],
        error: `Failed to fetch clients: ${clientsError.message}`,
        debugInfo
      };
    }
    
    // If both were requested but both failed
    if (!dataType && formsError && clientsError) {
      console.error('IntakeQ API errors:', { formsError, clientsError });
      return {
        forms: [],
        clients: [],
        error: `Failed to fetch IntakeQ data: ${formsError.message}`,
        debugInfo
      };
    }
    
    // Process form data if we have it
    let forms = [];
    if (Array.isArray(formsData)) {
      console.log("IntakeQ Forms API response:", formsData);
      forms = formsData.map((form) => ({
        id: form.id || form.formId || form.form_id || form.Id,
        name: form.name || form.title || form.form_name || form.formTitle || form.formName || `Form ${form.id || form.Id}`
      }));
    } else if (formsData?._isHtml && (dataType === 'form' || !dataType)) {
      return {
        forms: [],
        clients: clientsData ? processClientData(clientsData) : [],
        error: "Received HTML instead of JSON for forms. This likely means the API key is invalid or the authentication failed.",
        debugInfo
      };
    }
    
    // Process client data if we have it
    let clients = [];
    if (Array.isArray(clientsData)) {
      console.log("IntakeQ Clients API response:", clientsData);
      clients = processClientData(clientsData);
    } else if (clientsData?._isHtml && (dataType === 'client' || !dataType)) {
      return {
        forms: formsData ? forms : [],
        clients: [],
        error: "Received HTML instead of JSON for clients. This likely means the API key is invalid.",
        debugInfo
      };
    }
    
    return {
      forms,
      clients,
      error: null,
      debugInfo
    };
  } catch (error) {
    console.error('Error in fetchIntakeQData:', error);
    return {
      forms: [],
      clients: [],
      error: error instanceof Error ? error.message : "Failed to fetch IntakeQ data",
      debugInfo: null
    };
  }
};

// Helper function to process client data
function processClientData(clientsData) {
  if (!Array.isArray(clientsData)) return [];
  
  return clientsData
    .filter((client) => client.email || client.emailAddress || client.Email) // Only include clients with email
    .map((client) => ({
      id: client.id || client.clientId || client.client_id || client.Id || client.ClientId,
      email: client.email || client.emailAddress || client.Email || client.ClientEmail || client.emailAddress || client.clientEmail
    }));
}
