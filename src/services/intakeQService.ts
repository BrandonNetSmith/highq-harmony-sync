
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
        'https://intakeq.com/api/v1/questionnaires',
        'https://intakeq.com/api/questionnaires',
        'https://intakeq.com/api/v1/forms',
        'https://intakeq.com/api/forms',
        'https://intakeq.com/v1/forms',
        'https://intakeq.com/api/v1/templates',
        'https://intakeq.com/api/templates',
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
        
        // Check for errors or null results
        if (!result.data) {
          console.log(`Failed with API endpoint (null data): ${apiUrl}`);
          continue;
        }
        
        const resultData = result.data;
        const hasError = result.error || 
                        (resultData && typeof resultData === 'object' && '_error' in resultData) || 
                        (resultData && typeof resultData === 'object' && '_statusCode' in resultData && resultData._statusCode >= 400);
        
        if (!hasError && Array.isArray(resultData)) {
          formsData = resultData;
          console.log(`Success with API endpoint: ${apiUrl}`);
          break;
        } else {
          console.log(`Failed with API endpoint: ${apiUrl}`, 
                    resultData && typeof resultData === 'object' && '_statusCode' in resultData ? resultData._statusCode : result.error);
          
          formsError = result.error || {
            message: resultData && typeof resultData === 'object' && '_errorMessage' in resultData 
                    ? resultData._errorMessage 
                    : `Failed with ${apiUrl}`
          };
          
          debugInfo = {
            statusCode: resultData && typeof resultData === 'object' && '_statusCode' in resultData ? resultData._statusCode : 404,
            contentType: resultData && typeof resultData === 'object' && '_contentType' in resultData ? resultData._contentType : 'unknown',
            isHtml: resultData && typeof resultData === 'object' && '_isHtml' in resultData ? resultData._isHtml : false,
            hasParseError: resultData && typeof resultData === 'object' && '_parseError' in resultData ? resultData._parseError : false,
            requestUrl: apiUrl,
            errorMessage: resultData && typeof resultData === 'object' && '_errorMessage' in resultData 
                        ? resultData._errorMessage 
                        : null
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
            url: `${apiUrl}?limit=100`,
            method: 'GET',
            headers: {
              'X-Auth-Key': intakeq_key,
              'Accept': 'application/json'
            }
          }
        });
        
        // Check for errors or null results
        if (!result.data) {
          console.log(`Failed with API endpoint (null data): ${apiUrl}`);
          continue;
        }
        
        const resultData = result.data;
        const hasError = result.error || 
                        (resultData && typeof resultData === 'object' && '_error' in resultData) || 
                        (resultData && typeof resultData === 'object' && '_statusCode' in resultData && resultData._statusCode >= 400);
        
        if (!hasError && Array.isArray(resultData)) {
          clientsData = resultData;
          console.log(`Success with API endpoint: ${apiUrl}`);
          break;
        } else {
          console.log(`Failed with API endpoint: ${apiUrl}`, 
                    resultData && typeof resultData === 'object' && '_statusCode' in resultData ? resultData._statusCode : result.error);
          
          clientsError = result.error || {
            message: resultData && typeof resultData === 'object' && '_errorMessage' in resultData 
                    ? resultData._errorMessage 
                    : `Failed with ${apiUrl}`
          };
          
          // Only set debug info if we don't have it yet
          if (!debugInfo) {
            debugInfo = {
              statusCode: resultData && typeof resultData === 'object' && '_statusCode' in resultData ? resultData._statusCode : 404,
              contentType: resultData && typeof resultData === 'object' && '_contentType' in resultData ? resultData._contentType : 'unknown',
              isHtml: resultData && typeof resultData === 'object' && '_isHtml' in resultData ? resultData._isHtml : false, 
              hasParseError: resultData && typeof resultData === 'object' && '_parseError' in resultData ? resultData._parseError : false,
              requestUrl: apiUrl,
              errorMessage: resultData && typeof resultData === 'object' && '_errorMessage' in resultData 
                          ? resultData._errorMessage 
                          : null
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
    if (Array.isArray(formsData) && formsData.length > 0) {
      console.log("IntakeQ Forms API response:", formsData);
      forms = formsData.map((form: any) => ({
        id: form.id || form.Id || form.formId || form.form_id,
        name: form.name || form.Name || form.title || form.Title || form.form_name || form.formTitle || form.formName || `Form ${form.id || form.Id}`
      }));
    }
    
    // Process client data if we have it
    let clients = [];
    if (Array.isArray(clientsData) && clientsData.length > 0) {
      console.log("IntakeQ Clients API response:", clientsData);
      clients = processClientData(clientsData);
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
function processClientData(clientsData: any[]) {
  if (!Array.isArray(clientsData)) return [];
  
  return clientsData
    .filter((client) => client.email || client.emailAddress || client.Email) // Only include clients with email
    .map((client) => ({
      id: client.id || client.Id || client.clientId || client.ClientId || client.client_id,
      email: client.email || client.Email || client.emailAddress || client.EmailAddress || client.ClientEmail || client.emailAddress || client.clientEmail
    }));
}
