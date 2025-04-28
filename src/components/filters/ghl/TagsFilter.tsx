
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterBadges } from "../common/FilterBadges";

interface TagsFilterProps {
  tags: string[];
  availableTags: string[];
  onTagsChange: (tags: string[]) => void;
  disabled?: boolean;
}

export const TagsFilter = ({
  tags,
  availableTags,
  onTagsChange,
  disabled
}: TagsFilterProps) => {
  
  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter(t => t !== tag));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTagsChange(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean));
  };
  
  return (
    <div>
      <Label htmlFor="ghl-tags">Tags (comma-separated)</Label>
      <div className="flex gap-2 mb-2">
        <Input
          id="ghl-tags"
          value={tags.join(',')}
          onChange={handleInputChange}
          placeholder="Enter tags to filter"
          disabled={disabled}
        />
      </div>
      
      {tags.length > 0 && (
        <div className="mt-2">
          <FilterBadges
            items={tags}
            getDisplayValue={(tag) => tag}
            onRemove={handleRemoveTag}
            disabled={disabled}
          />
        </div>
      )}
      
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
  );
};
