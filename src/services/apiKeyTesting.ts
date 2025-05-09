import { supabase } from "@/integrations/supabase/client";

// Use the provided location ID
const LOCATION_ID = "GZecKV1IvZgcZdeVItxt";

export interface TestResult {
  success: boolean;
  message: string | null;
}

export const testGHLApiKey = async (apiKey: string): Promise<TestResult> => {
  try {
    // Use the services.leadconnectorhq.com endpoint that's known to work
    const url = `https://services.leadconnectorhq.com/contacts/?locationId=${LOCATION_ID}&limit=10`;
    const method = 'GET';
    const headers = { 
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Version': '2021-07-28'  // Make sure this header is included
    };
    
    console.log(`Testing GHL API with key: ${apiKey.substring(0, 5)}...`);
    
    const { data, error } = await supabase.functions.invoke('proxy', {
      body: {
        url,
        method,
        headers,
        body: null
      }
    });
    
    if (error) {
      console.error(`Proxy error:`, error);
      throw new Error(`Proxy request failed: ${error.message || error.toString()}`);
    }
    
    console.log(`GHL API test response:`, data);
    
    if (data._isHtml || data._redirect || data._error || data._statusCode >= 400) {
      console.error(`GHL API error:`, data);
      throw new Error(data._errorMessage || data._error || data.message || `Failed with status: ${data._statusCode}`);
    }
    
    return { 
      success: true, 
      message: `GoHighLevel connection successful!` 
    };
  } catch (error) {
    console.error(`GHL API test error:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : `Failed to test GHL API key` 
    };
  }
};

export const testIntakeQApiKey = async (apiKey: string): Promise<TestResult> => {
  try {
    // Use v1 API for IntakeQ
    const url = 'https://intakeq.com/api/v1/clients';
    const method = 'GET';
    const headers = { 'X-Auth-Key': apiKey };
    
    console.log(`Testing IntakeQ API with key: ${apiKey.substring(0, 5)}...`);
    
    const { data, error } = await supabase.functions.invoke('proxy', {
      body: {
        url,
        method,
        headers,
        body: null
      }
    });
    
    if (error) {
      console.error(`Proxy error:`, error);
      throw new Error(`Proxy request failed: ${error.message || error.toString()}`);
    }
    
    console.log(`IntakeQ API test response:`, data);
    
    if (data._isHtml || data._redirect || data._error || data._statusCode >= 400) {
      throw new Error(data._errorMessage || data._error || data.msg || `Failed with status: ${data._statusCode}`);
    }
    
    return { 
      success: true, 
      message: `IntakeQ connection successful!` 
    };
  } catch (error) {
    console.error(`IntakeQ API test error:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : `Failed to test IntakeQ API key` 
    };
  }
};
