
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { FilterDropdown } from "../common/FilterDropdown";
import { FilterBadges } from "../common/FilterBadges";
import { IntakeQClient } from "@/types/sync-filters";

interface ClientsFilterProps {
  clientIds: string[];
  availableClients: IntakeQClient[];
  onAddClient: (clientId: string, clientEmail: string) => void;
  onRemoveClient: (clientId: string) => void;
  disabled?: boolean;
}

export const ClientsFilter = ({
  clientIds,
  availableClients,
  onAddClient,
  onRemoveClient,
  disabled
}: ClientsFilterProps) => {
  const [selectedClientEmail, setSelectedClientEmail] = useState<string>("");
  
  const getClientEmailById = (id: string) => {
    const client = availableClients.find(client => client.id === id);
    return client ? client.email : id;
  };
  
  return (
    <div>
      <Label htmlFor="intakeq-clients">Client Emails</Label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <FilterDropdown
            items={availableClients}
            selectedValue={selectedClientEmail}
            displayProperty="email"
            idProperty="id"
            onSelect={(clientId, clientEmail) => {
              setSelectedClientEmail(clientEmail);
              onAddClient(clientId, clientEmail);
            }}
            placeholder="Select client..."
            disabled={disabled}
          />
        </div>
        
        <FilterBadges
          items={clientIds}
          getDisplayValue={getClientEmailById}
          onRemove={onRemoveClient}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
