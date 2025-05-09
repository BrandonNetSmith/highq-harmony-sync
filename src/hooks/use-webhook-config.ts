
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { saveApiKeys, getApiKeys } from '@/services/apiKeys';
import { testGHLApiKey, testIntakeQApiKey } from '@/services/apiKeyTesting';
import { ApiConfigForm, TestResult, TestingStatus, TestResults } from '@/types/webhook-config';

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
  const [testingKeys, setTestingKeys] = useState<TestingStatus>({ghl: false, intakeq: false});
  const [testResults, setTestResults] = useState<TestResults>({
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
      const result = type === 'ghl' 
        ? await testGHLApiKey(apiKey) 
        : await testIntakeQApiKey(apiKey);
      
      setTestResults(prev => ({ ...prev, [type]: result }));
      
      toast({
        title: result.success ? "Success" : "API Key Test Failed",
        description: result.message || `${type === 'ghl' ? 'GoHighLevel' : 'IntakeQ'} API test ${result.success ? 'succeeded' : 'failed'}`,
        variant: result.success ? "default" : "destructive",
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
