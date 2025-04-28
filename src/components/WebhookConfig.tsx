
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { saveApiKeys, getApiKeys } from '@/services/apiKeys';
import ApiKeyConfigSection from './ApiKeyConfigSection';

interface ApiConfigForm {
  ghlApiKey: string;
  intakeqApiKey: string;
}

const WebhookConfig = () => {
  const { toast } = useToast();
  const form = useForm<ApiConfigForm>({
    defaultValues: {
      ghlApiKey: '',
      intakeqApiKey: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [testingKeys, setTestingKeys] = useState<{ghl: boolean; intakeq: boolean}>({ghl: false, intakeq: false});
  const [testResults, setTestResults] = useState<{
    ghl: { success: boolean; message: string | null } | null;
    intakeq: { success: boolean; message: string | null } | null;
  }>({
    ghl: null,
    intakeq: null
  });

  useEffect(() => {
    const loadApiKeys = async () => {
      setIsLoading(true);
      setConnectionError(null);
      try {
        const keys = await getApiKeys();
        console.log("Loaded API keys:", keys ? "Keys found" : "No keys found");
        form.reset({
          ghlApiKey: keys.ghl_key || '',
          intakeqApiKey: keys.intakeq_key || ''
        });
      } catch (error) {
        console.error('Failed to load API keys:', error);
        setConnectionError('Failed to connect to Supabase. Please check your database schema - you may need to create the api_keys table.');
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKeys();
  }, [form]);

  const testApiKey = async (type: 'ghl' | 'intakeq') => {
    const apiKey = type === 'ghl' ? form.getValues('ghlApiKey') : form.getValues('intakeqApiKey');
    
    if (!apiKey) {
      toast({
        title: "Error",
        description: `Please enter an API key for ${type === 'ghl' ? 'GoHighLevel' : 'IntakeQ'} first`,
        variant: "destructive",
      });
      return;
    }
    
    setTestingKeys(prev => ({ ...prev, [type]: true }));
    setTestResults(prev => ({ ...prev, [type]: null }));
    
    try {
      let url;
      let headers;
      
      if (type === 'ghl') {
        url = 'https://rest.gohighlevel.com/v1/contacts/';
        headers = { 'Authorization': `Bearer ${apiKey}` };
      } else {
        url = 'https://intakeq.com/api/v1/clients';
        headers = { 'X-Auth-Key': apiKey };
      }
      
      console.log(`Testing ${type} API with key: ${apiKey.substring(0, 5)}...`);
      const baseUrl = window.location.origin;
      
      const response = await fetch(`${baseUrl}/api/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          method: 'GET',
          headers
        })
      });
      
      if (!response.ok) {
        throw new Error(`Proxy error: ${response.statusText || response.status}`);
      }
      
      const data = await response.json();
      
      if (data._isHtml || data._redirect || data._error || data._statusCode >= 400) {
        throw new Error(data._errorMessage || data._error || `Failed with status: ${data._statusCode}`);
      }
      
      setTestResults(prev => ({ 
        ...prev, 
        [type]: { 
          success: true, 
          message: `${type === 'ghl' ? 'GoHighLevel' : 'IntakeQ'} connection successful!` 
        } 
      }));
      
      toast({
        title: "Success",
        description: `${type === 'ghl' ? 'GoHighLevel' : 'IntakeQ'} API key is valid!`,
      });
    } catch (error) {
      console.error(`${type} API test error:`, error);
      
      setTestResults(prev => ({ 
        ...prev, 
        [type]: { 
          success: false, 
          message: error instanceof Error ? error.message : `Failed to test ${type} API key` 
        } 
      }));
      
      toast({
        title: "API Key Test Failed",
        description: error instanceof Error ? error.message : `Failed to test ${type} API key`,
        variant: "destructive",
      });
    } finally {
      setTestingKeys(prev => ({ ...prev, [type]: false }));
    }
  };

  const onSubmit = async (data: ApiConfigForm) => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      console.log("Saving API keys");
      await saveApiKeys(data.ghlApiKey, data.intakeqApiKey);
      toast({
        title: "Success",
        description: "API keys saved successfully",
      });
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save API keys",
        variant: "destructive",
      });
      setConnectionError('Failed to save to Supabase. Please make sure Row Level Security policies are configured correctly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApiKeyConfigSection
      form={form}
      isLoading={isLoading}
      connectionError={connectionError}
      onSubmit={onSubmit}
      onTestApiKey={testApiKey}
      testingKeys={testingKeys}
      testResults={testResults}
    />
  );
};

export default WebhookConfig;
