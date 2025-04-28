
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { FilterDropdown } from "../common/FilterDropdown";
import { FilterBadges } from "../common/FilterBadges";
import { IntakeQForm } from "@/types/sync-filters";

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
  const [selectedFormName, setSelectedFormName] = useState<string>("");
  
  const getFormNameById = (id: string) => {
    const form = availableForms.find(form => form.id === id);
    return form ? form.name : id;
  };
  
  return (
    <div>
      <Label htmlFor="intakeq-forms">Form Names</Label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <FilterDropdown
            items={availableForms}
            selectedValue={selectedFormName}
            displayProperty="name"
            idProperty="id"
            onSelect={(formId, formName) => {
              setSelectedFormName(formName);
              onAddForm(formId, formName);
            }}
            placeholder="Select form..."
            disabled={disabled}
          />
        </div>
        
        <FilterBadges
          items={formIds}
          getDisplayValue={getFormNameById}
          onRemove={onRemoveForm}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
