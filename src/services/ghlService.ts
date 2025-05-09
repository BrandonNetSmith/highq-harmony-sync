
import { getApiKeys } from "@/services/apiKeys";
import { supabase } from "@/integrations/supabase/client";

// Use the provided location ID
const LOCATION_ID = "GZecKV1IvZgcZdeVItxt";

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

    console.log("Testing GoHighLevel API connection using provided location ID...");
    
    // Use the services.leadconnectorhq.com API endpoint (known to work)
    const servicesUrl = 'https://services.leadconnectorhq.com';
    
    // Fetch tags
    const { data: tagsData, error: tagsError } = await supabase.functions.invoke('proxy', {
      body: {
        url: `${servicesUrl}/tags/?locationId=${LOCATION_ID}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ghl_key}`,
          'Accept': 'application/json',
          'Version': '2021-07-28'  // Make sure this header is included
        }
      }
    });
    
    if (tagsError || (tagsData && tagsData._statusCode >= 400)) {
      console.error('GHL Tags API error:', tagsError || tagsData);
      return {
        tags: [],
        statuses: [],
        error: `GoHighLevel API connection failed: ${tagsData?._errorMessage || tagsData?.message || tagsError?.message || 'Unknown error'}`
      };
    }
    
    console.log("GHL API response for tags:", tagsData);
    
    // Fetch pipelines using the services endpoint
    const { data: pipelineData, error: pipelineError } = await supabase.functions.invoke('proxy', {
      body: {
        url: `${servicesUrl}/pipelines/stages/?locationId=${LOCATION_ID}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ghl_key}`,
          'Accept': 'application/json',
          'Version': '2021-07-28'  // Make sure this header is included
        }
      }
    });
    
    if (pipelineError || (pipelineData && pipelineData._statusCode >= 400)) {
      console.error('GHL Pipeline API error:', pipelineError || pipelineData);
      
      // Return tags without statuses if pipeline fetch failed
      return {
        tags: tagsData.tags ? tagsData.tags.map((tag) => tag.name) : [],
        statuses: [],
        error: `Failed to fetch pipelines: ${pipelineError?.message || pipelineData?._errorMessage || 'Unknown error'}`
      };
    }
    
    console.log("GHL Pipelines API response:", pipelineData);
    
    // Process the pipeline data
    const statuses = [];
    if (pipelineData.stages) {
      pipelineData.stages.forEach((stage) => {
        if (stage.name) {
          statuses.push(stage.name);
        }
      });
    } else if (pipelineData.pipelineStages) {
      pipelineData.pipelineStages.forEach((stage) => {
        if (stage.name) {
          statuses.push(stage.name);
        }
      });
    }
    
    return {
      tags: tagsData.tags ? tagsData.tags.map((tag) => tag.name) : [],
      statuses: [...new Set(statuses)],
      error: null
    };
    
  } catch (error) {
    console.error('Error in fetchGHLData:', error);
    return {
      tags: [],
      statuses: [],
      error: error instanceof Error ? error.message : "Failed to fetch GHL data"
    };
  }
};
