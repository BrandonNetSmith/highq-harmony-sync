
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getApiKeys } from "@/services/apiKeys";
import { supabase } from "@/integrations/supabase/client";
import { GHLFilterCard } from './filters/GHLFilterCard';
import { IntakeQFilterCard } from './filters/IntakeQFilterCard';
import { SyncFiltersProps } from '@/types/sync-filters';

export const SyncFilters = ({
  ghlFilters,
  intakeqFilters,
  onGhlFiltersChange,
  onIntakeqFiltersChange,
  disabled
}: SyncFiltersProps) => {
  const { toast } = useToast();
  const [isLoadingGHL, setIsLoadingGHL] = useState(false);
  const [isLoadingIntakeQ, setIsLoadingIntakeQ] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableFormIds, setAvailableFormIds] = useState<string[]>([]);
  const [ghlApiError, setGhlApiError] = useState<string | null>(null);
  const [intakeqApiError, setIntakeqApiError] = useState<string | null>(null);
  const [intakeqDebugInfo, setIntakeqDebugInfo] = useState<any>(null);

  const fetchGHLData = async () => {
    setIsLoadingGHL(true);
    setGhlApiError(null);
    try {
      const { ghl_key } = await getApiKeys();
      
      if (!ghl_key) {
        toast({
          title: "API Key Missing",
          description: "Please set your GoHighLevel API key first",
          variant: "destructive"
        });
        setIsLoadingGHL(false);
        return;
      }

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
        throw new Error(`Failed to fetch tags: ${tagsError.message}`);
      }
      
      console.log("GHL API response:", tagsData);
      
      if (tagsData._statusCode >= 400) {
        throw new Error(tagsData._errorMessage || `Failed with status: ${tagsData._statusCode}`);
      }

      if (tagsData.tags) {
        const tags = tagsData.tags.map((tag: any) => tag.name) || [];
        setAvailableTags(tags);
        
        if (tags.length > 0) {
          toast({
            title: "Success",
            description: `Retrieved ${tags.length} tags from GoHighLevel`,
          });
        } else {
          toast({
            title: "Note",
            description: "No tags found in your GoHighLevel account",
          });
        }
      } else {
        setGhlApiError("Unexpected response format from GoHighLevel API");
      }
      
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
        throw new Error(`Failed to fetch pipelines: ${pipelineError.message}`);
      }
      
      console.log("GHL Pipelines API response:", pipelineData);
      
      if (pipelineData._statusCode >= 400) {
        throw new Error(pipelineData._errorMessage || `Failed with status: ${pipelineData._statusCode}`);
      }

      if (pipelineData.pipelines) {
        const statuses: string[] = [];
        pipelineData.pipelines.forEach((pipeline: any) => {
          pipeline.stages?.forEach((stage: any) => {
            statuses.push(stage.name);
          });
        });
        
        setAvailableStatuses([...new Set(statuses)]);
      }
    } catch (error) {
      console.error('Error fetching GHL data:', error);
      setGhlApiError(error instanceof Error ? error.message : "Failed to fetch GHL data");
      toast({
        title: "GHL API Error",
        description: error instanceof Error ? error.message : "Failed to fetch GHL data",
        variant: "destructive"
      });
    } finally {
      setIsLoadingGHL(false);
    }
  };

  const fetchIntakeQData = async () => {
    setIsLoadingIntakeQ(true);
    setIntakeqApiError(null);
    setIntakeqDebugInfo(null);
    
    try {
      const { intakeq_key } = await getApiKeys();
      
      if (!intakeq_key) {
        toast({
          title: "API Key Missing",
          description: "Please set your IntakeQ API key first",
          variant: "destructive"
        });
        setIsLoadingIntakeQ(false);
        return;
      }

      // Fix the API endpoint URL - use the correct v2 API path
      const { data, error } = await supabase.functions.invoke('proxy', {
        body: {
          url: 'https://intakeq.com/api/v2/forms',
          method: 'GET',
          headers: {
            'X-Auth-Key': intakeq_key
          }
        }
      });
      
      if (error) {
        console.error('IntakeQ Forms API error:', error);
        throw new Error(`Failed to fetch forms: ${error.message}`);
      }
      
      console.log("IntakeQ API response:", data);
      
      setIntakeqDebugInfo({
        statusCode: data._statusCode,
        contentType: data._contentType,
        isHtml: data._isHtml,
        hasParseError: !!data._parseError
      });
      
      if (data._error) {
        throw new Error(data._error);
      }
      
      if (data._statusCode >= 400) {
        throw new Error(data._errorMessage || `Failed with status: ${data._statusCode}`);
      }
      
      if (data._empty) {
        console.log("API returned an empty response");
        setAvailableFormIds([]);
        toast({
          title: "Note",
          description: "IntakeQ API returned an empty response. Your account may not have any forms created yet.",
        });
        return;
      }
      
      if (data._isHtml) {
        throw new Error("Received HTML instead of JSON. This likely means the API key is invalid or the authentication failed.");
      }
      
      if (data._parseError) {
        throw new Error(`Parse error: ${data._parseError}`);
      }

      if (Array.isArray(data)) {
        const formIds = data.map((form: any) => form.id) || [];
        setAvailableFormIds(formIds);
        
        if (formIds.length > 0) {
          toast({
            title: "Success",
            description: `Retrieved ${formIds.length} forms from IntakeQ`,
          });
        } else {
          toast({
            title: "Note",
            description: "No forms found in your IntakeQ account",
          });
        }
      } else {
        setIntakeqApiError("Unexpected response format from IntakeQ API");
      }
    } catch (error) {
      console.error('Error fetching IntakeQ data:', error);
      setIntakeqApiError(error instanceof Error ? error.message : "Failed to fetch IntakeQ data");
      toast({
        title: "IntakeQ API Error",
        description: error instanceof Error ? error.message : "Failed to fetch IntakeQ data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingIntakeQ(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <GHLFilterCard
          filters={ghlFilters}
          onFiltersChange={onGhlFiltersChange}
          isLoading={isLoadingGHL}
          apiError={ghlApiError}
          availableTags={availableTags}
          availableStatuses={availableStatuses}
          onFetchData={fetchGHLData}
          disabled={disabled}
        />

        <IntakeQFilterCard
          filters={intakeqFilters}
          onFiltersChange={onIntakeqFiltersChange}
          isLoading={isLoadingIntakeQ}
          apiError={intakeqApiError}
          availableFormIds={availableFormIds}
          onFetchData={fetchIntakeQData}
          disabled={disabled}
          debugInfo={intakeqDebugInfo}
        />
      </div>
    </div>
  );
};
