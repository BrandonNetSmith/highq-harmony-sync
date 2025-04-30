
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterBadges } from "../common/FilterBadges";
import { IntakeQForm } from "@/types/sync-filters";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormsFilterProps {
  formIds: string[];
  availableForms: IntakeQForm[];
  onAddForm: (formId: string, formName: string) => void;
  onRemoveForm: (formId: string) => void;
  disabled?: boolean;
}

export const FormsFilter = ({
  formIds,
  availableForms,
  onAddForm,
  onRemoveForm,
  disabled
}: FormsFilterProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();
  
  const getFormNameById = (id: string) => {
    const form = availableForms.find(form => form.id === id);
    return form ? form.name : id;
  };
  
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    // Case insensitive search
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const matchingForms = availableForms.filter(form => 
      form.name.toLowerCase().includes(normalizedSearchTerm)
    );
    
    if (matchingForms.length > 0) {
      const form = matchingForms[0];
      onAddForm(form.id, form.name);
      
      toast({
        title: "Form found",
        description: `Added "${form.name}" to filters. Only this form will be synchronized.`,
      });
      
      setSearchTerm("");
    } else {
      toast({
        title: "Form not found",
        description: `No form found with name containing "${searchTerm}"`,
        variant: "destructive"
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="intakeq-forms" className="font-medium">Forms</Label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="intakeq-forms"
              type="text"
              placeholder="Search for form name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="pr-10"
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm("")}
                disabled={disabled}
              >
                ×
              </Button>
            )}
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={disabled || !searchTerm.trim()}
            className="shrink-0"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        {availableForms.length === 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            No forms loaded. Click "Fetch Forms" to load form data.
          </p>
        )}
        
        <FilterBadges
          items={formIds}
          getDisplayValue={getFormNameById}
          onRemove={onRemoveForm}
          disabled={disabled}
        />

        {formIds.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Note:</strong> When forms are selected, only these forms will sync. If combined with client selection, only these forms for those clients will sync.
          </p>
        )}
      </div>
    </div>
  );
};
