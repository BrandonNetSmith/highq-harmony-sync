
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

    // Fetch tags using the tags endpoint
    const { data: tagsData, error: tagsError } = await supabase.functions.invoke('proxy', {
      body: {
        url: 'https://rest.gohighlevel.com/v1/tags/',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ghl_key}`
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
    
    // Use the search contacts API instead of the deprecated contacts endpoint
    // This endpoint requires a POST request with search parameters
    const { data: contactsData, error: contactsError } = await supabase.functions.invoke('proxy', {
      body: {
        url: 'https://rest.gohighlevel.com/v1/contacts/search',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghl_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          limit: 5, // Just fetch a few contacts for testing
          offset: 0,
          query: "" // Empty query to match all contacts
        })
      }
    });
    
    if (contactsError) {
      console.error('GHL Contacts API error:', contactsError);
      console.log('Continuing with pipeline request despite contact search error');
    } else {
      console.log("GHL Contacts search API response:", contactsData);
    }
    
    // Fetch pipelines to get contact statuses
    const { data: pipelineData, error: pipelineError } = await supabase.functions.invoke('proxy', {
      body: {
        url: 'https://rest.gohighlevel.com/v1/pipelines/',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ghl_key}`
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
