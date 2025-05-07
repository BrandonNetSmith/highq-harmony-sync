
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { saveApiKeys, getApiKeys } from '@/services/apiKeys';
import { supabase } from '@/integrations/supabase/client';

interface ApiConfigForm {
  ghlApiKey: string;
  intakeqApiKey: string;
}

interface TestResult {
  success: boolean;
  message: string | null;
}

export const useWebhookConfig = () => {
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
    ghl: TestResult | null;
    intakeq: TestResult | null;
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
      let method;
      let headers;
      let requestBody;
      
      if (type === 'ghl') {
        // Use the search contacts endpoint exactly as specified in their documentation
        url = 'https://rest.gohighlevel.com/v1/contacts/search';
        method = 'POST';
        headers = { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        };
        // Format the request body exactly as required by the API
        requestBody = JSON.stringify({ 
          limit: 5, 
          offset: 0,
          query: "" // Empty query to match all contacts
        });
      } else {
        // Use v1 API for IntakeQ
        url = 'https://intakeq.com/api/v1/clients';
        method = 'GET';
        headers = { 'X-Auth-Key': apiKey };
        requestBody = null;
      }
      
      console.log(`Testing ${type} API with key: ${apiKey.substring(0, 5)}...`);
      
      const { data, error } = await supabase.functions.invoke('proxy', {
        body: {
          url,
          method,
          headers,
          body: requestBody
        }
      });
      
      if (error) {
        console.error(`Proxy error:`, error);
        throw new Error(`Proxy request failed: ${error.message || error.toString()}`);
      }
      
      console.log(`${type} API test response:`, data);
      
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

  return {
    form,
    isLoading,
    connectionError,
    testingKeys,
    testResults,
    testApiKey,
    onSubmit
  };
};
