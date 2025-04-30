
import { getApiKeys } from "@/services/apiKeys";
import { supabase } from "@/integrations/supabase/client";

export const fetchIntakeQData = async () => {
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
    
    // IntakeQ API endpoints - try different formats if one fails
    const apiFormats = [
      'https://intakeq.com/api/v1/forms',
      'https://intakeq.com/api/forms',
      'https://intakeq.com/v1/forms'
    ];
    
    let formsData = null;
    let formsError = null;
    let debugInfo = null;
    
    // Try each API format until one works
    for (const apiUrl of apiFormats) {
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
    
    if (formsError && !formsData) {
      console.error('IntakeQ Forms API error:', formsError);
      return {
        forms: [],
        clients: [],
        error: `Failed to fetch forms: ${formsError.message}`,
        debugInfo
      };
    }
    
    console.log("IntakeQ Forms API response:", formsData);
    
    if (!debugInfo && formsData?._statusCode) {
      debugInfo = {
        statusCode: formsData._statusCode,
        contentType: formsData._contentType,
        isHtml: !!formsData._isHtml,
        hasParseError: !!formsData._parseError,
        requestUrl: formsData._requestUrl || 'Unknown URL',
        errorMessage: formsData._errorMessage || null
      };
    }
    
    if (formsData?._error) {
      return {
        forms: [],
        clients: [],
        error: formsData._error,
        debugInfo
      };
    }
    
    if (formsData?._statusCode >= 400) {
      return {
        forms: [],
        clients: [],
        error: formsData._errorMessage || `Failed with status: ${formsData._statusCode}`,
        debugInfo
      };
    }
    
    let forms = [];
    
    if (formsData?._empty) {
      console.log("API returned an empty response for forms");
    } else if (formsData?._isHtml) {
      return {
        forms: [],
        clients: [],
        error: "Received HTML instead of JSON. This likely means the API key is invalid or the authentication failed.",
        debugInfo
      };
    } else if (formsData?._parseError) {
      return {
        forms: [],
        clients: [],
        error: `Parse error: ${formsData._parseError}`,
        debugInfo
      };
    } else if (Array.isArray(formsData)) {
      forms = formsData.map((form) => ({
        id: form.id || form.formId || form.form_id || form.Id,
        name: form.name || form.title || form.form_name || form.formTitle || form.formName || `Form ${form.id || form.Id}`
      }));
    }

    // Now for clients, try different API formats as well
    const clientApiFormats = [
      'https://intakeq.com/api/v1/clients',
      'https://intakeq.com/api/clients',
      'https://intakeq.com/v1/clients'
    ];
    
    let clientsData = null;
    let clientsError = null;
    
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
      }
    }
    
    if (clientsError && !clientsData) {
      console.error('IntakeQ Clients API error:', clientsError);
      return {
        forms,
        clients: [],
        error: `Failed to fetch clients: ${clientsError.message}`,
        debugInfo
      };
    }
    
    console.log("IntakeQ Clients API response:", clientsData);
    
    let clients = [];
    
    if (clientsData?._statusCode >= 400) {
      console.warn(`Client fetch failed with status: ${clientsData._statusCode}`);
    } else if (clientsData?._empty) {
      console.log("API returned an empty response for clients");
    } else if (clientsData?._isHtml) {
      return {
        forms,
        clients: [],
        error: "Received HTML instead of JSON for clients. This likely means the API key is invalid.",
        debugInfo
      };
    } else if (Array.isArray(clientsData)) {
      clients = clientsData
        .filter((client) => client.email || client.emailAddress || client.Email) // Only include clients with email
        .map((client) => ({
          id: client.id || client.clientId || client.client_id || client.Id || client.ClientId,
          email: client.email || client.emailAddress || client.Email || client.ClientEmail || client.emailAddress || client.clientEmail
        }));
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
