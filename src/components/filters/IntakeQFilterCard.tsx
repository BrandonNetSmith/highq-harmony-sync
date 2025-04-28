
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { IntakeQFilters } from "@/types/sync-filters";

interface IntakeQFilterCardProps {
  filters: IntakeQFilters;
  onFiltersChange: (filters: IntakeQFilters) => void;
  isLoading: boolean;
  apiError: string | null;
  availableFormIds: string[];
  onFetchData: () => void;
  disabled?: boolean;
  debugInfo?: any;
}

export const IntakeQFilterCard = ({
  filters,
  onFiltersChange,
  isLoading,
  apiError,
  availableFormIds,
  onFetchData,
  disabled,
  debugInfo
}: IntakeQFilterCardProps) => {
  const handleAddFormId = (formId: string) => {
    if (formId && !filters.formIds.includes(formId)) {
      onFiltersChange({
        ...filters,
        formIds: [...filters.formIds, formId]
      });
    }
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
          <Label htmlFor="intakeq-client-ids">Client IDs (comma-separated)</Label>
          <Input
            id="intakeq-client-ids"
            value={filters.clientIds.join(',')}
            onChange={(e) => onFiltersChange({
              ...filters,
              clientIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
            })}
            placeholder="Enter client IDs for testing"
            disabled={disabled}
          />
        </div>
        
        <div>
          <Label htmlFor="intakeq-form-ids">Form IDs (comma-separated)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              id="intakeq-form-ids"
              value={filters.formIds.join(',')}
              onChange={(e) => onFiltersChange({
                ...filters,
                formIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
              })}
              placeholder="Enter form IDs to filter"
              disabled={disabled}
            />
          </div>
          
          {availableFormIds.length > 0 && (
            <div className="mt-2">
              <Label className="text-sm">Available Form IDs:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {availableFormIds.slice(0, 10).map((formId, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddFormId(formId)}
                    disabled={disabled}
                    className="text-xs py-0 h-6"
                  >
                    {formId}
                  </Button>
                ))}
                {availableFormIds.length > 10 && (
                  <span className="text-xs text-muted-foreground">
                    +{availableFormIds.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
