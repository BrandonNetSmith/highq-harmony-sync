
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterBadges } from "../common/FilterBadges";
import { IntakeQClient } from "@/types/sync-filters";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const { toast } = useToast();
  
  const getClientEmailById = (id: string) => {
    const client = availableClients.find(client => client.id === id);
    return client ? client.email : id;
  };
  
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Case insensitive search, trimming whitespace
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    // Search for matching clients - using more flexible matching
    const matchingClients = availableClients.filter(client => 
      client.email.toLowerCase().includes(normalizedSearchTerm)
    );
    
    if (matchingClients.length > 0) {
      // Add the first matching client if found
      const client = matchingClients[0];
      onAddClient(client.id, client.email);
      
      // Show success toast
      toast({
        title: "Client found",
        description: `Added ${client.email} to filters. Only data for this client will be synchronized.`,
      });
      
      setSearchTerm("");
    } else {
      // Show not found toast with more helpful info
      toast({
        title: "Client not found",
        description: `No client found with email containing "${searchTerm}". Try using partial email or fetch more clients first.`,
        variant: "destructive"
      });
      
      // Log available clients for debugging
      console.log("Available clients:", availableClients);
      console.log("Search term:", normalizedSearchTerm);
    }
    
    setIsSearching(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  
  return (
    <div>
      <Label htmlFor="intakeq-clients">Client Emails</Label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for client email..."
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
            disabled={disabled || !searchTerm.trim() || isSearching}
            className="shrink-0"
          >
            {isSearching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
        </div>
        
        {availableClients.length === 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            No clients loaded. Click "Fetch Clients" to load client data.
          </p>
        )}
        
        <FilterBadges
          items={clientIds}
          getDisplayValue={getClientEmailById}
          onRemove={onRemoveClient}
          disabled={disabled}
        />

        {clientIds.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Note:</strong> When a client is selected, only data for this client will sync. Combined with form selection, only that form for this client will sync.
          </p>
        )}
      </div>
    </div>
  );
};
