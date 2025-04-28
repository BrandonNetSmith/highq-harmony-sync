
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { getApiKeys } from "@/services/apiKeys";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
  const [ghlApiError, setGhlApiError] = useState<string | null>(null);
  const [intakeqApiError, setIntakeqApiError] = useState<string | null>(null);
  const [intakeqRawResponse, setIntakeqRawResponse] = useState<string | null>(null);
  const [intakeqDebugInfo, setIntakeqDebugInfo] = useState<any>(null);

  const fetchGHLData = async () => {
    setIsLoadingGHL(true);
    setGhlApiError(null);
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

      const baseUrl = window.location.origin;
      console.log(`Current site base URL: ${baseUrl}`);

      const response = await fetch(`${baseUrl}/api/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://rest.gohighlevel.com/v1/tags/',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ghl_key}`
          }
        })
      });
      
      if (!response.ok) {
        console.log(`Proxy returned status: ${response.status}`);
        throw new Error(`Proxy error: ${response.statusText || response.status}`);
      }
      
      const data = await response.json();
      console.log("GHL API response:", data);
      
      if (data._statusCode >= 400) {
        throw new Error(data._errorMessage || `Failed with status: ${data._statusCode}`);
      }

      if (data.tags) {
        const tags = data.tags.map((tag: any) => tag.name) || [];
        setAvailableTags(tags);
        
        if (tags.length > 0) {
          toast({
            title: "Success",
            description: `Retrieved ${tags.length} tags from GoHighLevel`,
          });
        } else {
          toast({
            title: "Note",
            description: "No tags found in your GoHighLevel account",
          });
        }
      } else {
        setGhlApiError("Unexpected response format from GoHighLevel API");
      }
      
      const statusResponse = await fetch(`${baseUrl}/api/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://rest.gohighlevel.com/v1/pipelines/',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ghl_key}`
          }
        })
      });
      
      if (!statusResponse.ok) {
        console.log(`Proxy returned status: ${statusResponse.status}`);
        throw new Error(`Proxy error: ${statusResponse.statusText || statusResponse.status}`);
      }
      
      const statusData = await statusResponse.json();
      console.log("GHL Pipelines API response:", statusData);
      
      if (statusData._statusCode >= 400) {
        throw new Error(statusData._errorMessage || `Failed with status: ${statusData._statusCode}`);
      }

      if (statusData.pipelines) {
        const statuses: string[] = [];
        statusData.pipelines.forEach((pipeline: any) => {
          pipeline.stages?.forEach((stage: any) => {
            statuses.push(stage.name);
          });
        });
        
        setAvailableStatuses([...new Set(statuses)]);
      }
    } catch (error) {
      console.error('Error fetching GHL data:', error);
      setGhlApiError(error instanceof Error ? error.message : "Failed to fetch GHL data");
      toast({
        title: "GHL API Error",
        description: error instanceof Error ? error.message : "Failed to fetch GHL data",
        variant: "destructive"
      });
    } finally {
      setIsLoadingGHL(false);
    }
  };

  const fetchIntakeQData = async () => {
    setIsLoadingIntakeQ(true);
    setIntakeqApiError(null);
    setIntakeqRawResponse(null);
    setIntakeqDebugInfo(null);
    
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

      console.log("Calling IntakeQ API with key:", intakeq_key.substring(0, 5) + "...");
      
      const baseUrl = window.location.origin;
      console.log(`Current site base URL for IntakeQ request: ${baseUrl}`);
      
      // Fix: changed the endpoint URL from 'forms' to 'forms/list' which is the correct endpoint
      const response = await fetch(`${baseUrl}/api/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://intakeq.com/api/v1/forms/list',
          method: 'GET',
          headers: {
            'X-Auth-Key': intakeq_key
          }
        })
      });
      
      if (!response.ok) {
        console.log(`Proxy returned status: ${response.status}`);
        throw new Error(`Proxy error: ${response.statusText || response.status}`);
      }
      
      console.log("IntakeQ API raw response:", response);
      
      const data = await response.json();
      console.log("IntakeQ API parsed response:", data);

      setIntakeqDebugInfo({
        statusCode: data._statusCode,
        contentType: data._contentType,
        isHtml: data._isHtml,
        hasParseError: !!data._parseError
      });
      
      if (data._error) {
        throw new Error(data._error);
      }
      
      if (data._statusCode >= 400) {
        throw new Error(data._errorMessage || `Failed with status: ${data._statusCode}`);
      }
      
      if (data._empty) {
        console.log("API returned an empty response");
        setAvailableFormIds([]);
        toast({
          title: "Note",
          description: "IntakeQ API returned an empty response. Your account may not have any forms created yet.",
        });
        return;
      }
      
      if (data._isHtml) {
        setIntakeqRawResponse(data._htmlSnippet || "HTML response received (no content provided)");
        throw new Error("Received HTML instead of JSON. This likely means the API key is invalid or the authentication failed.");
      }
      
      if (data._parseError) {
        throw new Error(`Parse error: ${data._parseError}`);
      }

      if (Array.isArray(data)) {
        const formIds = data.map((form: any) => form.id) || [];
        setAvailableFormIds(formIds);
        
        if (formIds.length > 0) {
          toast({
            title: "Success",
            description: `Retrieved ${formIds.length} forms from IntakeQ`,
          });
        } else {
          toast({
            title: "Note",
            description: "No forms found in your IntakeQ account",
          });
        }
      } else if (data.text) {
        setIntakeqRawResponse(data.text.substring(0, 200));
        throw new Error(`Unexpected response format: ${data.text.substring(0, 100)}...`);
      } else {
        setIntakeqApiError("Unexpected response format from IntakeQ API");
      }
    } catch (error) {
      console.error('Error fetching IntakeQ data:', error);
      setIntakeqApiError(error instanceof Error ? error.message : "Failed to fetch IntakeQ data");
      toast({
        title: "IntakeQ API Error",
        description: error instanceof Error ? error.message : "Failed to fetch IntakeQ data",
        variant: "destructive",
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
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>GoHighLevel Filters</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchGHLData}
                disabled={isLoadingGHL || disabled}
              >
                {isLoadingGHL ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Fetch Options
              </Button>
            </CardTitle>
            <CardDescription>Filter which GHL records to sync</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ghlApiError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>GoHighLevel API Error</AlertTitle>
                <AlertDescription>
                  {ghlApiError}
                  {ghlApiError.includes("401") && (
                    <p className="mt-2 text-sm font-medium">
                      Your API key may be invalid or expired. Please check your API key in the API Configuration section below.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
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
            <CardTitle className="flex items-center justify-between">
              <span>IntakeQ Filters</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchIntakeQData}
                disabled={isLoadingIntakeQ || disabled}
              >
                {isLoadingIntakeQ ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Fetch Options
              </Button>
            </CardTitle>
            <CardDescription>Filter which IntakeQ records to sync</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {intakeqApiError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>IntakeQ API Error</AlertTitle>
                <AlertDescription>
                  {intakeqApiError}
                  {intakeqRawResponse && intakeqApiError.includes("HTML") && (
                    <>
                      <p className="mt-2 text-sm font-medium">
                        The API is returning HTML instead of JSON. This likely means:
                      </p>
                      <ul className="list-disc pl-5 mt-1 text-sm">
                        <li>Your API key is invalid or expired</li>
                        <li>The IntakeQ API endpoint URL may have changed</li>
                        <li>IntakeQ may be down or experiencing issues</li>
                      </ul>
                      <p className="mt-2 text-sm font-medium">
                        Please check your API key in the API Configuration section below and try again.
                      </p>
                      {intakeqDebugInfo && (
                        <div className="mt-2 p-2 bg-gray-800 text-white rounded text-xs">
                          <p>Debug info (for troubleshooting):</p>
                          <p>Status: {intakeqDebugInfo.statusCode}</p>
                          <p>Content-Type: {intakeqDebugInfo.contentType}</p>
                          <p>IsHTML: {intakeqDebugInfo.isHtml ? 'Yes' : 'No'}</p>
                          <p>Parse Error: {intakeqDebugInfo.hasParseError ? 'Yes' : 'No'}</p>
                        </div>
                      )}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
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
    </div>
  );
};
