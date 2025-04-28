
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getApiKeys } from "@/services/apiKeys";
import { supabase } from "@/integrations/supabase/client";
import { GHLFilterCard } from './filters/GHLFilterCard';
import { IntakeQFilterCard } from './filters/IntakeQFilterCard';
import { SyncFiltersProps } from '@/types/sync-filters';
import { fetchGHLData } from '@/services/ghlService';
import { fetchIntakeQData } from '@/services/intakeQService';

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
  const [availableForms, setAvailableForms] = useState<{id: string, name: string}[]>([]);
  const [availableClients, setAvailableClients] = useState<{id: string, email: string}[]>([]);
  const [ghlApiError, setGhlApiError] = useState<string | null>(null);
  const [intakeqApiError, setIntakeqApiError] = useState<string | null>(null);
  const [intakeqDebugInfo, setIntakeqDebugInfo] = useState<any>(null);

  const handleFetchGHLData = async () => {
    setIsLoadingGHL(true);
    setGhlApiError(null);
    try {
      const { tags, statuses, error } = await fetchGHLData();
      
      if (error) {
        throw new Error(error);
      }
      
      setAvailableTags(tags);
      setAvailableStatuses(statuses);
      
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

  const handleFetchIntakeQData = async () => {
    setIsLoadingIntakeQ(true);
    setIntakeqApiError(null);
    setIntakeqDebugInfo(null);
    
    try {
      const { forms, clients, error, debugInfo } = await fetchIntakeQData();
      
      if (debugInfo) {
        setIntakeqDebugInfo(debugInfo);
      }
      
      if (error) {
        throw new Error(error);
      }
      
      setAvailableForms(forms);
      setAvailableClients(clients);
      
      if (forms.length > 0) {
        toast({
          title: "Success",
          description: `Retrieved ${forms.length} forms from IntakeQ`,
        });
      } else {
        toast({
          title: "Note",
          description: "No forms found in your IntakeQ account",
        });
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
          onFetchData={handleFetchGHLData}
          disabled={disabled}
        />

        <IntakeQFilterCard
          filters={intakeqFilters}
          onFiltersChange={onIntakeqFiltersChange}
          isLoading={isLoadingIntakeQ}
          apiError={intakeqApiError}
          availableForms={availableForms}
          availableClients={availableClients}
          onFetchData={handleFetchIntakeQData}
          disabled={disabled}
          debugInfo={intakeqDebugInfo}
        />
      </div>
    </div>
  );
};
