
import React from 'react';
import { Label } from "@/components/ui/label";
import { FilterBadges } from "../common/FilterBadges";
import { IntakeQForm } from "@/types/sync-filters";
import { Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  
  const getFormNameById = (id: string) => {
    const form = availableForms.find(form => form.id === id);
    return form ? form.name : id;
  };
  
  const handleSelectForm = (formId: string) => {
    if (!formId) return;
    
    const form = availableForms.find(form => form.id === formId);
    
    if (form) {
      if (formIds.includes(formId)) {
        // If already selected, remove it
        onRemoveForm(formId);
        
        toast({
          title: "Form removed",
          description: `Removed "${form.name}" from filters.`,
        });
      } else {
        // Add the form
        onAddForm(form.id, form.name);
        
        toast({
          title: "Form added",
          description: `Added "${form.name}" to filters.`,
        });
      }
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="intakeq-forms" className="font-medium">Forms</Label>
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={disabled || availableForms.length === 0}
            >
              <span className="truncate">
                {formIds.length > 0
                  ? `${formIds.length} form${formIds.length > 1 ? 's' : ''} selected`
                  : "Select forms..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search forms..." />
              <CommandList>
                <CommandEmpty>No forms found</CommandEmpty>
                <CommandGroup heading="Available Forms">
                  {availableForms.map(form => (
                    <CommandItem
                      key={form.id}
                      value={form.id}
                      onSelect={() => handleSelectForm(form.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formIds.includes(form.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {form.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
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
