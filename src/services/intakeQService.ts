
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
    
    // Updated endpoint based on IntakeQ API documentation
    const { data: formsData, error: formsError } = await supabase.functions.invoke('proxy', {
      body: {
        url: 'https://intakeq.com/api/v2/forms', // Using v2 API with correct endpoint
        method: 'GET',
        headers: {
          'X-Auth-Key': intakeq_key
        }
      }
    });
    
    if (formsError) {
      console.error('IntakeQ Forms API error:', formsError);
      return {
        forms: [],
        clients: [],
        error: `Failed to fetch forms: ${formsError.message}`,
        debugInfo: null
      };
    }
    
    console.log("IntakeQ Forms API response:", formsData);
    
    const debugInfo = {
      statusCode: formsData?._statusCode,
      contentType: formsData?._contentType,
      isHtml: !!formsData?._isHtml,
      hasParseError: !!formsData?._parseError,
      requestUrl: formsData?._requestUrl || 'Unknown URL',
      errorMessage: formsData?._errorMessage || null
    };
    
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
        id: form.id || form.formId || form.form_id,
        name: form.name || form.title || form.form_name || `Form ${form.id}`
      }));
    }

    // Updated endpoint for clients with v2 API
    const { data: clientsData, error: clientsError } = await supabase.functions.invoke('proxy', {
      body: {
        url: 'https://intakeq.com/api/v2/clients',
        method: 'GET',
        headers: {
          'X-Auth-Key': intakeq_key
        }
      }
    });
    
    if (clientsError) {
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
        .filter((client) => client.email || client.emailAddress) // Only include clients with email
        .map((client) => ({
          id: client.id || client.clientId || client.client_id,
          email: client.email || client.emailAddress || client.email_address
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
