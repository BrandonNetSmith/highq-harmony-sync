
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { fetchGHLData } from '@/services/ghlService';
import { fetchIntakeQData } from '@/services/intakeQService';
import type { IntakeQForm, IntakeQClient } from '@/types/sync-filters';

export const useFilterData = () => {
  const { toast } = useToast();
  const [isLoadingGHL, setIsLoadingGHL] = useState(false);
  const [isLoadingIntakeQ, setIsLoadingIntakeQ] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableForms, setAvailableForms] = useState<IntakeQForm[]>([]);
  const [availableClients, setAvailableClients] = useState<IntakeQClient[]>([]);
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

  const handleFetchIntakeQData = async (dataType?: 'client' | 'form') => {
    setIsLoadingIntakeQ(true);
    setIntakeqApiError(null);
    setIntakeqDebugInfo(null);
    
    try {
      const { forms, clients, error, debugInfo } = await fetchIntakeQData(dataType);
      
      if (debugInfo) {
        setIntakeqDebugInfo(debugInfo);
      }
      
      if (error) {
        throw new Error(error);
      }
      
      // Only update the state for the data types we fetched
      if (dataType === undefined || dataType === 'form') {
        setAvailableForms(forms);
        if (forms && forms.length > 0) {
          toast({
            title: "Success",
            description: `Retrieved ${forms.length} forms from IntakeQ`,
          });
        } else if (dataType === 'form') {
          toast({
            title: "Note",
            description: "No forms found in your IntakeQ account",
          });
        }
      }
      
      if (dataType === undefined || dataType === 'client') {
        setAvailableClients(clients);
        if (clients && clients.length > 0) {
          toast({
            title: "Success",
            description: `Retrieved ${clients.length} clients from IntakeQ`,
          });
          
          // Log clients for troubleshooting
          console.log("Fetched clients:", clients);
        } else if (dataType === 'client') {
          toast({
            title: "Note",
            description: "No clients found in your IntakeQ account",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching IntakeQ data:', error);
      setIntakeqApiError(error instanceof Error ? error.message : "Failed to fetch IntakeQ data");
      
      // Show a more specific error message based on the data type
      const dataTypeText = dataType ? `IntakeQ ${dataType}s` : "IntakeQ data";
      toast({
        title: "IntakeQ API Error",
        description: `Failed to fetch ${dataTypeText}: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingIntakeQ(false);
    }
  };

  return {
    isLoadingGHL,
    isLoadingIntakeQ,
    availableTags,
    availableStatuses,
    availableForms,
    availableClients,
    ghlApiError,
    intakeqApiError,
    intakeqDebugInfo,
    handleFetchGHLData,
    handleFetchIntakeQData
  };
};
