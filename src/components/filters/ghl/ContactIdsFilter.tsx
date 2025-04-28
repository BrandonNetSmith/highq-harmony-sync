
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FilterBadges } from "../common/FilterBadges";

interface ContactIdsFilterProps {
  contactIds: string[];
  onContactIdsChange: (contactIds: string[]) => void;
  disabled?: boolean;
}

export const ContactIdsFilter = ({
  contactIds,
  onContactIdsChange,
  disabled
}: ContactIdsFilterProps) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onContactIdsChange(e.target.value.split(',').map(id => id.trim()).filter(Boolean));
  };
  
  const handleRemoveContactId = (id: string) => {
    onContactIdsChange(contactIds.filter(contactId => contactId !== id));
  };
  
  return (
    <div>
      <Label htmlFor="ghl-contact-ids">Contact IDs (comma-separated)</Label>
      <Input
        id="ghl-contact-ids"
        value={contactIds.join(',')}
        onChange={handleInputChange}
        placeholder="Enter contact IDs for testing"
        disabled={disabled}
      />
      
      {contactIds.length > 0 && (
        <div className="mt-2">
          <FilterBadges
            items={contactIds}
            getDisplayValue={(id) => id}
            onRemove={handleRemoveContactId}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};
