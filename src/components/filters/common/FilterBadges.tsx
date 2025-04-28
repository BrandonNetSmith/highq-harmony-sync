
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterBadgesProps {
  items: string[];
  getDisplayValue: (id: string) => string;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const FilterBadges = ({ 
  items, 
  getDisplayValue, 
  onRemove, 
  disabled 
}: FilterBadgesProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(id => (
        <Badge key={id} variant="secondary" className="flex items-center gap-1">
          {getDisplayValue(id)}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={() => onRemove(id)}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
};
