
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterBadges } from "../common/FilterBadges";

interface StatusFilterProps {
  statuses: string[];
  availableStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;
  disabled?: boolean;
}

export const StatusFilter = ({
  statuses,
  availableStatuses,
  onStatusesChange,
  disabled
}: StatusFilterProps) => {
  
  const handleAddStatus = (status: string) => {
    if (status && !statuses.includes(status)) {
      onStatusesChange([...statuses, status]);
    }
  };
  
  const handleRemoveStatus = (status: string) => {
    onStatusesChange(statuses.filter(s => s !== status));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStatusesChange(e.target.value.split(',').map(status => status.trim()).filter(Boolean));
  };
  
  return (
    <div>
      <Label htmlFor="ghl-status">Status (comma-separated)</Label>
      <div className="flex gap-2 mb-2">
        <Input
          id="ghl-status"
          value={statuses.join(',')}
          onChange={handleInputChange}
          placeholder="Enter statuses to filter"
          disabled={disabled}
        />
      </div>
      
      {statuses.length > 0 && (
        <div className="mt-2">
          <FilterBadges
            items={statuses}
            getDisplayValue={(status) => status}
            onRemove={handleRemoveStatus}
            disabled={disabled}
          />
        </div>
      )}
      
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
  );
};
