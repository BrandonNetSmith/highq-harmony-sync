
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { FilterConfig } from "@/types/sync-filters";

interface GHLFilterCardProps {
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  isLoading: boolean;
  apiError: string | null;
  availableTags: string[];
  availableStatuses: string[];
  onFetchData: () => void;
  disabled?: boolean;
}

export const GHLFilterCard = ({
  filters,
  onFiltersChange,
  isLoading,
  apiError,
  availableTags,
  availableStatuses,
  onFetchData,
  disabled
}: GHLFilterCardProps) => {
  const handleAddTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      onFiltersChange({
        ...filters,
        tags: [...filters.tags, tag]
      });
    }
  };

  const handleAddStatus = (status: string) => {
    if (status && !filters.status.includes(status)) {
      onFiltersChange({
        ...filters,
        status: [...filters.status, status]
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>GoHighLevel Filters</span>
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
        <CardDescription>Filter which GHL records to sync</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>GoHighLevel API Error</AlertTitle>
            <AlertDescription>
              {apiError}
              {apiError.includes("401") && (
                <p className="mt-2 text-sm font-medium">
                  Your API key may be invalid or expired. Please check your API key in the API Configuration section below.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div>
          <Label htmlFor="ghl-contact-ids">Contact IDs (comma-separated)</Label>
          <Input
            id="ghl-contact-ids"
            value={filters.contactIds.join(',')}
            onChange={(e) => onFiltersChange({
              ...filters,
              contactIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
            })}
            placeholder="Enter contact IDs for testing"
            disabled={disabled}
          />
        </div>
        
        <div>
          <Label htmlFor="ghl-tags">Tags (comma-separated)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              id="ghl-tags"
              value={filters.tags.join(',')}
              onChange={(e) => onFiltersChange({
                ...filters,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              })}
              placeholder="Enter tags to filter"
              disabled={disabled}
            />
          </div>
          
          {availableTags.length > 0 && (
            <div className="mt-2">
              <Label className="text-sm">Available Tags:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {availableTags.slice(0, 10).map((tag, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddTag(tag)}
                    disabled={disabled}
                    className="text-xs py-0 h-6"
                  >
                    {tag}
                  </Button>
                ))}
                {availableTags.length > 10 && (
                  <span className="text-xs text-muted-foreground">
                    +{availableTags.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="ghl-status">Status (comma-separated)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              id="ghl-status"
              value={filters.status.join(',')}
              onChange={(e) => onFiltersChange({
                ...filters,
                status: e.target.value.split(',').map(status => status.trim()).filter(Boolean)
              })}
              placeholder="Enter statuses to filter"
              disabled={disabled}
            />
          </div>
          
          {availableStatuses.length > 0 && (
            <div className="mt-2">
              <Label className="text-sm">Available Statuses:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {availableStatuses.slice(0, 10).map((status, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddStatus(status)}
                    disabled={disabled}
                    className="text-xs py-0 h-6"
                  >
                    {status}
                  </Button>
                ))}
                {availableStatuses.length > 10 && (
                  <span className="text-xs text-muted-foreground">
                    +{availableStatuses.length - 10} more
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
