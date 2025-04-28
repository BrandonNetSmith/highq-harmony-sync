
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

    // Updated URL to use correct IntakeQ API endpoint
    const { data: formsData, error: formsError } = await supabase.functions.invoke('proxy', {
      body: {
        url: 'https://api.intakeq.com/api/v1/forms',
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
      statusCode: formsData._statusCode,
      contentType: formsData._contentType,
      isHtml: formsData._isHtml,
      hasParseError: !!formsData._parseError
    };
    
    if (formsData._error) {
      return {
        forms: [],
        clients: [],
        error: formsData._error,
        debugInfo
      };
    }
    
    if (formsData._statusCode >= 400) {
      return {
        forms: [],
        clients: [],
        error: formsData._errorMessage || `Failed with status: ${formsData._statusCode}`,
        debugInfo
      };
    }
    
    let forms: {id: string, name: string}[] = [];
    
    if (formsData._empty) {
      console.log("API returned an empty response for forms");
    } else if (formsData._isHtml) {
      return {
        forms: [],
        clients: [],
        error: "Received HTML instead of JSON. This likely means the API key is invalid or the authentication failed.",
        debugInfo
      };
    } else if (formsData._parseError) {
      return {
        forms: [],
        clients: [],
        error: `Parse error: ${formsData._parseError}`,
        debugInfo
      };
    } else if (Array.isArray(formsData)) {
      forms = formsData.map((form: any) => ({
        id: form.id || form.formId,
        name: form.name || form.title || `Form ${form.id}`
      }));
    }

    // Updated URL to use correct IntakeQ API endpoint
    const { data: clientsData, error: clientsError } = await supabase.functions.invoke('proxy', {
      body: {
        url: 'https://api.intakeq.com/api/v1/clients',
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
    
    let clients: {id: string, email: string}[] = [];
    
    if (clientsData._statusCode >= 400) {
      console.warn(`Client fetch failed with status: ${clientsData._statusCode}`);
    } else if (clientsData._empty) {
      console.log("API returned an empty response for clients");
    } else if (Array.isArray(clientsData)) {
      clients = clientsData
        .filter((client: any) => client.emailAddress) // Only include clients with email
        .map((client: any) => ({
          id: client.id,
          email: client.emailAddress
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
