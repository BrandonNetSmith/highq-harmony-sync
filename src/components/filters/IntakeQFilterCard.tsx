
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { IntakeQFilters } from "@/types/sync-filters";
import { ApiErrorAlert } from './intakeq/ApiErrorAlert';
import { ClientsFilter } from './intakeq/ClientsFilter';
import { FormsFilter } from './intakeq/FormsFilter';

interface IntakeQFilterCardProps {
  filters: IntakeQFilters;
  onFiltersChange: (filters: IntakeQFilters) => void;
  isLoading: boolean;
  apiError: string | null;
  availableForms: {id: string, name: string}[];
  availableClients: {id: string, email: string}[];
  onFetchData: () => void;
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={onFetchData}
            disabled={isLoading || disabled}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span>Fetch Options</span>
          </Button>
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
          disabled={disabled}
        />
        
        <FormsFilter
          formIds={filters.formIds}
          availableForms={availableForms}
          onAddForm={handleAddFormId}
          onRemoveForm={handleRemoveFormId}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};
