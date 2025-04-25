
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { getApiKeys } from "@/services/apiKeys";

interface FilterConfig {
  contactIds: string[];
  tags: string[];
  status: string[];
}

interface SyncFiltersProps {
  ghlFilters: FilterConfig;
  intakeqFilters: {
    clientIds: string[];
    formIds: string[];
    status: string[];
  };
  onGhlFiltersChange: (filters: FilterConfig) => void;
  onIntakeqFiltersChange: (filters: any) => void;
  disabled?: boolean;
}

export const SyncFilters = ({
  ghlFilters,
  intakeqFilters,
  onGhlFiltersChange,
  onIntakeqFiltersChange,
  disabled
}: SyncFiltersProps) => {
  const { toast } = useToast();
  const [isLoadingGHL, setIsLoadingGHL] = useState(false);
  const [isLoadingIntakeQ, setIsLoadingIntakeQ] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableFormIds, setAvailableFormIds] = useState<string[]>([]);

  const fetchGHLData = async () => {
    setIsLoadingGHL(true);
    try {
      const { ghl_key } = await getApiKeys();
      
      if (!ghl_key) {
        toast({
          title: "API Key Missing",
          description: "Please set your GoHighLevel API key first",
          variant: "destructive"
        });
        setIsLoadingGHL(false);
        return;
      }

      // Fetch tags
      const tagsResponse = await fetch('https://rest.gohighlevel.com/v1/tags/', {
        headers: {
          'Authorization': `Bearer ${ghl_key}`
        }
      });
      
      if (!tagsResponse.ok) {
        throw new Error(`Failed to fetch GHL tags: ${tagsResponse.status}`);
      }
      
      const tagsData = await tagsResponse.json();
      const tags = tagsData.tags?.map((tag: any) => tag.name) || [];
      setAvailableTags(tags);
      
      // Fetch statuses
      const statusResponse = await fetch('https://rest.gohighlevel.com/v1/pipelines/', {
        headers: {
          'Authorization': `Bearer ${ghl_key}`
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to fetch GHL statuses: ${statusResponse.status}`);
      }
      
      const statusData = await statusResponse.json();
      const statuses: string[] = [];
      statusData.pipelines?.forEach((pipeline: any) => {
        pipeline.stages?.forEach((stage: any) => {
          statuses.push(stage.name);
        });
      });
      
      setAvailableStatuses([...new Set(statuses)]);
      
      toast({
        title: "Success",
        description: "GoHighLevel data fetched successfully",
      });
    } catch (error) {
      console.error('Error fetching GHL data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch GHL data",
        variant: "destructive"
      });
    } finally {
      setIsLoadingGHL(false);
    }
  };

  const fetchIntakeQData = async () => {
    setIsLoadingIntakeQ(true);
    try {
      const { intakeq_key } = await getApiKeys();
      
      if (!intakeq_key) {
        toast({
          title: "API Key Missing",
          description: "Please set your IntakeQ API key first",
          variant: "destructive"
        });
        setIsLoadingIntakeQ(false);
        return;
      }

      // Fetch forms
      const formsResponse = await fetch('https://intakeq.com/api/v1/forms', {
        headers: {
          'X-Auth-Key': intakeq_key
        }
      });
      
      if (!formsResponse.ok) {
        throw new Error(`Failed to fetch IntakeQ forms: ${formsResponse.status}`);
      }
      
      const formsData = await formsResponse.json();
      const formIds = formsData.map((form: any) => form.id) || [];
      setAvailableFormIds(formIds);
      
      toast({
        title: "Success",
        description: "IntakeQ data fetched successfully",
      });
    } catch (error) {
      console.error('Error fetching IntakeQ data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch IntakeQ data",
        variant: "destructive"
      });
    } finally {
      setIsLoadingIntakeQ(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !ghlFilters.tags.includes(tag)) {
      onGhlFiltersChange({
        ...ghlFilters,
        tags: [...ghlFilters.tags, tag]
      });
    }
  };

  const handleAddStatus = (status: string) => {
    if (status && !ghlFilters.status.includes(status)) {
      onGhlFiltersChange({
        ...ghlFilters,
        status: [...ghlFilters.status, status]
      });
    }
  };

  const handleAddFormId = (formId: string) => {
    if (formId && !intakeqFilters.formIds.includes(formId)) {
      onIntakeqFiltersChange({
        ...intakeqFilters,
        formIds: [...intakeqFilters.formIds, formId]
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>GoHighLevel Filters</CardTitle>
          <CardDescription>Filter which GHL records to sync</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={fetchGHLData}
              disabled={isLoadingGHL || disabled}
            >
              {isLoadingGHL ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Fetch Available Options
            </Button>
          </div>
          
          <div>
            <Label htmlFor="ghl-contact-ids">Contact IDs (comma-separated)</Label>
            <Input
              id="ghl-contact-ids"
              value={ghlFilters.contactIds.join(',')}
              onChange={(e) => onGhlFiltersChange({
                ...ghlFilters,
                contactIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
              })}
              placeholder="Enter contact IDs for testing"
              disabled={disabled}
            />
          </div>
          
          <div>
            <Label htmlFor="ghl-tags">Tags (comma-separated)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="ghl-tags"
                value={ghlFilters.tags.join(',')}
                onChange={(e) => onGhlFiltersChange({
                  ...ghlFilters,
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                placeholder="Enter tags to filter"
                disabled={disabled}
              />
            </div>
            
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
                  {availableTags.length > 10 && <span className="text-xs text-muted-foreground">+{availableTags.length - 10} more</span>}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="ghl-status">Status (comma-separated)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="ghl-status"
                value={ghlFilters.status.join(',')}
                onChange={(e) => onGhlFiltersChange({
                  ...ghlFilters,
                  status: e.target.value.split(',').map(status => status.trim()).filter(Boolean)
                })}
                placeholder="Enter statuses to filter"
                disabled={disabled}
              />
            </div>
            
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
                  {availableStatuses.length > 10 && <span className="text-xs text-muted-foreground">+{availableStatuses.length - 10} more</span>}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IntakeQ Filters</CardTitle>
          <CardDescription>Filter which IntakeQ records to sync</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={fetchIntakeQData}
              disabled={isLoadingIntakeQ || disabled}
            >
              {isLoadingIntakeQ ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Fetch Available Options
            </Button>
          </div>
          
          <div>
            <Label htmlFor="intakeq-client-ids">Client IDs (comma-separated)</Label>
            <Input
              id="intakeq-client-ids"
              value={intakeqFilters.clientIds.join(',')}
              onChange={(e) => onIntakeqFiltersChange({
                ...intakeqFilters,
                clientIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
              })}
              placeholder="Enter client IDs for testing"
              disabled={disabled}
            />
          </div>
          
          <div>
            <Label htmlFor="intakeq-form-ids">Form IDs (comma-separated)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="intakeq-form-ids"
                value={intakeqFilters.formIds.join(',')}
                onChange={(e) => onIntakeqFiltersChange({
                  ...intakeqFilters,
                  formIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                })}
                placeholder="Enter form IDs to filter"
                disabled={disabled}
              />
            </div>
            
            {availableFormIds.length > 0 && (
              <div className="mt-2">
                <Label className="text-sm">Available Form IDs:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableFormIds.slice(0, 10).map((formId, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddFormId(formId)}
                      disabled={disabled}
                      className="text-xs py-0 h-6"
                    >
                      {formId}
                    </Button>
                  ))}
                  {availableFormIds.length > 10 && <span className="text-xs text-muted-foreground">+{availableFormIds.length - 10} more</span>}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
