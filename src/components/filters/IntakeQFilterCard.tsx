
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, Loader2, RefreshCw, ChevronDown, Check, X } from "lucide-react";
import { IntakeQFilters } from "@/types/sync-filters";
import { Badge } from "@/components/ui/badge";

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
  const [selectedClientEmail, setSelectedClientEmail] = useState<string>("");
  const [selectedFormName, setSelectedFormName] = useState<string>("");

  const handleAddClientId = (clientId: string, clientEmail: string) => {
    if (clientId && !filters.clientIds.includes(clientId)) {
      setSelectedClientEmail("");
      onFiltersChange({
        ...filters,
        clientIds: [...filters.clientIds, clientId]
      });
    }
  };

  const handleAddFormId = (formId: string, formName: string) => {
    if (formId && !filters.formIds.includes(formId)) {
      setSelectedFormName("");
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

  // Map IDs to names/emails for display
  const getClientEmailById = (id: string) => {
    const client = availableClients.find(client => client.id === id);
    return client ? client.email : id;
  };

  const getFormNameById = (id: string) => {
    const form = availableForms.find(form => form.id === id);
    return form ? form.name : id;
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
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Fetch Options
          </Button>
        </CardTitle>
        <CardDescription>Filter which IntakeQ records to sync</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>IntakeQ API Error</AlertTitle>
            <AlertDescription>
              {apiError}
              {apiError.includes("HTML") && (
                <>
                  <p className="mt-2 text-sm font-medium">
                    The API is returning HTML instead of JSON. This likely means:
                  </p>
                  <ul className="list-disc pl-5 mt-1 text-sm">
                    <li>Your API key is invalid or expired</li>
                    <li>The IntakeQ API endpoint URL may have changed</li>
                    <li>IntakeQ may be down or experiencing issues</li>
                  </ul>
                  <p className="mt-2 text-sm font-medium">
                    Please check your API key in the API Configuration section below and try again.
                  </p>
                  {debugInfo && (
                    <div className="mt-2 p-2 bg-gray-800 text-white rounded text-xs">
                      <p>Debug info (for troubleshooting):</p>
                      <p>Status: {debugInfo.statusCode}</p>
                      <p>Content-Type: {debugInfo.contentType}</p>
                      <p>IsHTML: {debugInfo.isHtml ? 'Yes' : 'No'}</p>
                      <p>Parse Error: {debugInfo.hasParseError ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div>
          <Label htmlFor="intakeq-clients">Client Emails</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={disabled || availableClients.length === 0}>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="truncate">{selectedClientEmail || "Select client..."}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[200px] overflow-y-auto w-[300px]">
                  {availableClients.map((client) => (
                    <DropdownMenuItem
                      key={client.id}
                      onSelect={() => {
                        setSelectedClientEmail(client.email);
                        handleAddClientId(client.id, client.email);
                      }}
                    >
                      {client.email}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {filters.clientIds.map(id => (
                <Badge key={id} variant="secondary" className="flex items-center gap-1">
                  {getClientEmailById(id)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => handleRemoveClientId(id)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="intakeq-forms">Form Names</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={disabled || availableForms.length === 0}>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="truncate">{selectedFormName || "Select form..."}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[200px] overflow-y-auto w-[300px]">
                  {availableForms.map((form) => (
                    <DropdownMenuItem
                      key={form.id}
                      onSelect={() => {
                        setSelectedFormName(form.name);
                        handleAddFormId(form.id, form.name);
                      }}
                    >
                      {form.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {filters.formIds.map(id => (
                <Badge key={id} variant="secondary" className="flex items-center gap-1">
                  {getFormNameById(id)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => handleRemoveFormId(id)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
