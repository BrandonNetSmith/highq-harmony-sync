
import { getApiKeys } from "@/services/apiKeys";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

    // First, make a call to get a location ID which is required for subsequent calls
    const { data: locationData, error: locationError } = await supabase.functions.invoke('proxy', {
      body: {
        url: 'https://services.leadconnectorhq.com/locations/',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ghl_key}`,
          'Version': '2021-07-28',
          'Accept': 'application/json'
        }
      }
    });
    
    if (locationError) {
      console.error('GHL Location API error:', locationError);
      return {
        tags: [],
        statuses: [],
        error: `Failed to fetch locations: ${locationError.message}`
      };
    }
    
    console.log("GHL Locations API response:", locationData);
    
    if (locationData._statusCode >= 400 || !locationData.locations || locationData.locations.length === 0) {
      const errorMsg = locationData._errorMessage || `Failed with status: ${locationData._statusCode || 'Unknown'}`;
      console.error('GHL Location API error:', errorMsg);
      return {
        tags: [],
        statuses: [],
        error: `Failed to get location: ${errorMsg}`
      };
    }
    
    // Extract the first location ID
    const locationId = locationData.locations[0].id;
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
        url: `https://services.leadconnectorhq.com/locations/${locationId}/tags/`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ghl_key}`,
          'Version': '2021-07-28',
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

    const tags = tagsData.tags ? tagsData.tags.map((tag: any) => tag.name) : [];
    
    // Fetch contacts with the location ID
    const { data: contactsData, error: contactsError } = await supabase.functions.invoke('proxy', {
      body: {
        url: `https://services.leadconnectorhq.com/locations/${locationId}/contacts/`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ghl_key}`,
          'Version': '2021-07-28',
          'Accept': 'application/json'
        },
        body: null
      }
    });
    
    if (contactsError) {
      console.error('GHL Contacts API error:', contactsError);
      console.log('Continuing with pipeline request despite contact search error');
    } else {
      console.log("GHL Contacts API response:", contactsData);
    }
    
    // Fetch pipelines with the location ID
    const { data: pipelineData, error: pipelineError } = await supabase.functions.invoke('proxy', {
      body: {
        url: `https://services.leadconnectorhq.com/locations/${locationId}/pipelines/`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ghl_key}`,
          'Version': '2021-07-28',
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

    const statuses: string[] = [];
    if (pipelineData.pipelines) {
      pipelineData.pipelines.forEach((pipeline: any) => {
        pipeline.stages?.forEach((stage: any) => {
          statuses.push(stage.name);
        });
      });
    }
    
    return {
      tags,
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
