
import { getApiKeys } from "@/services/apiKeys";
import { supabase } from "@/integrations/supabase/client";

export const fetchGHLData = async () => {
  try {
    const { ghl_key } = await getApiKeys();
    
    if (!ghl_key) {
      return {
        tags: [],
        statuses: [],
        error: "Please set your GoHighLevel API key first"
      };
    }

    console.log("Testing GoHighLevel API connection...");
    
    // Try the new API format first
    const { data: locationData, error: locationError } = await supabase.functions.invoke('proxy', {
      body: {
        url: 'https://api.gohighlevel.com/v1/locations/',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ghl_key}`,
          'Accept': 'application/json'
        }
      }
    });
    
    if (locationError || (locationData && locationData.msg === "Not found")) {
      console.error('GHL Location API error:', locationError || locationData.msg);
      console.log('Trying alternate API endpoint...');
      
      // Try the legacy API endpoint as fallback
      const { data: legacyLocationData, error: legacyLocationError } = await supabase.functions.invoke('proxy', {
        body: {
          url: 'https://rest.gohighlevel.com/v1/locations/',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ghl_key}`,
            'Accept': 'application/json'
          }
        }
      });
      
      if (legacyLocationError || (legacyLocationData && legacyLocationData._statusCode >= 400)) {
        console.error('Legacy GHL API also failed:', legacyLocationError || legacyLocationData);
        return {
          tags: [],
          statuses: [],
          error: `GoHighLevel API connection failed. Please verify your API key format and permissions.`
        };
      }
      
      // Use legacy data if it worked
      console.log("Legacy API response:", legacyLocationData);
      return processGHLData(ghl_key, legacyLocationData, true);
    }
    
    console.log("GHL Locations API response:", locationData);
    return processGHLData(ghl_key, locationData, false);
    
  } catch (error) {
    console.error('Error in fetchGHLData:', error);
    return {
      tags: [],
      statuses: [],
      error: error instanceof Error ? error.message : "Failed to fetch GHL data"
    };
  }
};

// Helper function to process location data and fetch tags/statuses
async function processGHLData(ghl_key, locationData, isLegacy) {
  const baseUrl = isLegacy ? 'https://rest.gohighlevel.com/v1' : 'https://api.gohighlevel.com/v1';
  
  if (!locationData.locations || locationData.locations.length === 0) {
    const errorMsg = locationData._errorMessage || locationData.msg || `Failed with status: ${locationData._statusCode || 'Unknown'}`;
    console.error('GHL Location API error:', errorMsg);
    return {
      tags: [],
      statuses: [],
      error: `Failed to get location: ${errorMsg}`
    };
  }
  
  // Extract the first location ID
  const locationId = locationData.locations[0]?.id;
  console.log("Using location ID:", locationId);
  
  if (!locationId) {
    return {
      tags: [],
      statuses: [],
      error: "No location ID found in your account"
    };
  }

  // Fetch tags using the location ID
  const { data: tagsData, error: tagsError } = await supabase.functions.invoke('proxy', {
    body: {
      url: `${baseUrl}/locations/${locationId}/tags`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ghl_key}`,
        'Accept': 'application/json'
      }
    }
  });
  
  if (tagsError) {
    console.error('GHL Tags API error:', tagsError);
    return {
      tags: [],
      statuses: [],
      error: `Failed to fetch tags: ${tagsError.message}`
    };
  }
  
  console.log("GHL API response for tags:", tagsData);
  
  if (tagsData._statusCode >= 400) {
    return {
      tags: [],
      statuses: [],
      error: tagsData._errorMessage || `Failed with status: ${tagsData._statusCode}`
    };
  }

  const tags = tagsData.tags ? tagsData.tags.map((tag) => tag.name) : [];
  
  // Fetch pipelines with the location ID
  const { data: pipelineData, error: pipelineError } = await supabase.functions.invoke('proxy', {
    body: {
      url: `${baseUrl}/locations/${locationId}/pipelines`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ghl_key}`,
        'Accept': 'application/json'
      }
    }
  });
  
  if (pipelineError) {
    console.error('GHL Pipeline API error:', pipelineError);
    return {
      tags,
      statuses: [],
      error: `Failed to fetch pipelines: ${pipelineError.message}`
    };
  }
  
  console.log("GHL Pipelines API response:", pipelineData);
  
  if (pipelineData._statusCode >= 400) {
    return {
      tags,
      statuses: [],
      error: pipelineData._errorMessage || `Failed with status: ${pipelineData._statusCode}`
    };
  }

  const statuses = [];
  if (pipelineData.pipelines) {
    pipelineData.pipelines.forEach((pipeline) => {
      pipeline.stages?.forEach((stage) => {
        statuses.push(stage.name);
      });
    });
  }
  
  return {
    tags,
    statuses: [...new Set(statuses)],
    error: null
  };
}
