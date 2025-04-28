
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { FilterConfig } from "@/types/sync-filters";
import { TagsFilter } from './ghl/TagsFilter';
import { StatusFilter } from './ghl/StatusFilter';
import { ContactIdsFilter } from './ghl/ContactIdsFilter';
import { ApiErrorAlert } from './ghl/ApiErrorAlert';

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
  
  const handleContactIdsChange = (contactIds: string[]) => {
    onFiltersChange({
      ...filters,
      contactIds
    });
  };
  
  const handleTagsChange = (tags: string[]) => {
    onFiltersChange({
      ...filters,
      tags
    });
  };
  
  const handleStatusesChange = (status: string[]) => {
    onFiltersChange({
      ...filters,
      status
    });
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
        {apiError && <ApiErrorAlert apiError={apiError} />}
        
        <ContactIdsFilter
          contactIds={filters.contactIds}
          onContactIdsChange={handleContactIdsChange}
          disabled={disabled}
        />
        
        <TagsFilter
          tags={filters.tags}
          availableTags={availableTags}
          onTagsChange={handleTagsChange}
          disabled={disabled}
        />
        
        <StatusFilter
          statuses={filters.status}
          availableStatuses={availableStatuses}
          onStatusesChange={handleStatusesChange}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};
