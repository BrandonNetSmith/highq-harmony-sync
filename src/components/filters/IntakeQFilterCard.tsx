
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, FileText, InfoIcon } from "lucide-react";
import { IntakeQFilters } from "@/types/sync-filters";
import { ApiErrorAlert } from './intakeq/ApiErrorAlert';
import { ClientsFilter } from './intakeq/ClientsFilter';
import { FormsFilter } from './intakeq/FormsFilter';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IntakeQFilterCardProps {
  filters: IntakeQFilters;
  onFiltersChange: (filters: IntakeQFilters) => void;
  isLoading: boolean;
  apiError: string | null;
  availableForms: {id: string, name: string}[];
  availableClients: {id: string, email: string}[];
  onFetchData: (dataType?: 'client' | 'form' | 'appointment') => void;
  disabled?: boolean;
  debugInfo?: any;
}

export const IntakeQFilterCard = ({
  filters,
  onFiltersChange,
  isLoading,
  apiError,
  availableForms,
  availableClients,
  onFetchData,
  disabled,
  debugInfo
}: IntakeQFilterCardProps) => {
  // Track separate loading states for each data type
  const [loadingStates, setLoadingStates] = React.useState({
    client: false,
    form: false
  });
  const timeoutRef = React.useRef<Record<string, NodeJS.Timeout | null>>({
    client: null,
    form: null
  });
  
  // Clean up timeouts on unmount
  React.useEffect(() => {
    return () => {
      Object.values(timeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);
  
  // Generate a summary of current filter settings
  const getFilterSummary = () => {
    if (filters.clientIds.length === 0 && filters.formIds.length === 0) {
      return "No filters applied - all IntakeQ data will be synchronized";
    }
    
    let summary = [];
    
    if (filters.clientIds.length > 0) {
      const clientText = filters.clientIds.length === 1 
        ? "1 specific client" 
        : `${filters.clientIds.length} specific clients`;
      summary.push(clientText);
    }
    
    if (filters.formIds.length > 0) {
      const formText = filters.formIds.length === 1 
        ? "1 specific form" 
        : `${filters.formIds.length} specific forms`;
      summary.push(formText);
    }
    
    if (summary.length === 0) {
      return "No filters applied";
    }
    
    return `Only synchronizing: ${summary.join(" and ")}`;
  };
  
  // Handle fetch for a specific data type
  const handleFetchClick = (dataType: 'client' | 'form') => {
    // Prevent double-clicks and respect global loading/disabled state
    if (isLoading || loadingStates[dataType] || disabled) return;
    
    // Set local loading state for this specific data type
    setLoadingStates(prev => ({ ...prev, [dataType]: true }));
    
    // Call the passed onFetchData function with the specific data type
    onFetchData(dataType);
    
    // Set a timeout to clear the loading state after a reasonable time if the fetch doesn't complete
    if (timeoutRef.current[dataType]) {
      clearTimeout(timeoutRef.current[dataType]!);
    }
    
    timeoutRef.current[dataType] = setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [dataType]: false }));
      console.log(`Force reset IntakeQ ${dataType} fetch loading state after timeout`);
    }, 10000); // 10 seconds timeout
  };
  
  // Clear loading state when isLoading changes to false
  React.useEffect(() => {
    if (!isLoading) {
      Object.keys(timeoutRef.current).forEach(key => {
        const dataType = key as 'client' | 'form';
        if (timeoutRef.current[dataType]) {
          clearTimeout(timeoutRef.current[dataType]!);
          timeoutRef.current[dataType] = null;
        }
      });
      setLoadingStates({
        client: false,
        form: false
      });
    }
  }, [isLoading]);

  const handleAddClientId = (clientId: string, clientEmail: string) => {
    if (clientId && !filters.clientIds.includes(clientId)) {
      onFiltersChange({
        ...filters,
        clientIds: [...filters.clientIds, clientId]
      });
    }
  };

  const handleAddFormId = (formId: string, formName: string) => {
    if (formId && !filters.formIds.includes(formId)) {
      onFiltersChange({
        ...filters,
        formIds: [...filters.formIds, formId]
      });
    }
  };

  const handleRemoveClientId = (clientId: string) => {
    onFiltersChange({
      ...filters,
      clientIds: filters.clientIds.filter(id => id !== clientId)
    });
  };

  const handleRemoveFormId = (formId: string) => {
    onFiltersChange({
      ...filters,
      formIds: filters.formIds.filter(id => id !== formId)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>IntakeQ Filters</span>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleFetchClick('client')}
              disabled={isLoading || loadingStates.client || disabled}
              className="flex items-center gap-2"
              title="Fetch client data from IntakeQ"
            >
              {loadingStates.client ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
              <span>{loadingStates.client ? "Fetching..." : "Fetch Clients"}</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleFetchClick('form')}
              disabled={isLoading || loadingStates.form || disabled}
              className="flex items-center gap-2"
              title="Fetch form data from IntakeQ"
            >
              {loadingStates.form ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              <span>{loadingStates.form ? "Fetching..." : "Fetch Forms"}</span>
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Filter which IntakeQ records to sync</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError && (
          <ApiErrorAlert apiError={apiError} debugInfo={debugInfo} />
        )}
        
        <ClientsFilter
          clientIds={filters.clientIds}
          availableClients={availableClients}
          onAddClient={handleAddClientId}
          onRemoveClient={handleRemoveClientId}
          disabled={disabled || isLoading || loadingStates.client}
        />
        
        <FormsFilter
          formIds={filters.formIds}
          availableForms={availableForms}
          onAddForm={handleAddFormId}
          onRemoveForm={handleRemoveFormId}
          disabled={disabled || isLoading || loadingStates.form}
        />

        {(filters.clientIds.length > 0 || filters.formIds.length > 0) && (
          <Alert className="mt-4">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Current filter settings:</strong> {getFilterSummary()}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
