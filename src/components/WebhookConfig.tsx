
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { saveApiKeys, getApiKeys } from '@/services/apiKeys';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    // Reset test results
    setTestResults(prev => ({ ...prev, [type]: null }));
    
    try {
      let url;
      let headers;
      
      if (type === 'ghl') {
        url = 'https://rest.gohighlevel.com/v1/contacts/';
        headers = { 'Authorization': `Bearer ${apiKey}` };
      } else {
        // Using a different endpoint for IntakeQ testing - the /forms endpoint seems to have issues
        url = 'https://intakeq.com/api/v1/clients';
        headers = { 'X-Auth-Key': apiKey };
      }
      
      console.log(`Testing ${type} API with key: ${apiKey.substring(0, 5)}...`);
      console.log(`URL: ${url}`);
      
      // Get the base URL of the site for making API requests
      const baseUrl = window.location.origin;
      console.log(`Current site base URL: ${baseUrl}`);
      
      // Make the request to our proxy
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
        console.log(`Proxy returned status: ${response.status}`);
        throw new Error(`Proxy error: ${response.statusText || response.status}`);
      }
      
      const data = await response.json();
      console.log(`${type} API test response:`, data);
      
      // Check for various error conditions
      if (data._error || data._statusCode >= 400 || data._isHtml) {
        const errorMsg = data._errorMessage || data._error || `Failed with status: ${data._statusCode}`;
        throw new Error(errorMsg);
      }
      
      // Success!
      setTestResults(prev => ({ 
        ...prev, 
        [type]: { success: true, message: `${type === 'ghl' ? 'GoHighLevel' : 'IntakeQ'} API connection successful!` } 
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
    <div className="grid gap-4 md:grid-cols-2">
      {connectionError && (
        <div className="md:col-span-2 bg-destructive/15 p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="text-destructive h-5 w-5" />
          <p className="text-destructive">{connectionError}</p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>GoHighLevel API</CardTitle>
          <CardDescription>Configure your GoHighLevel API key</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="ghlApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder="Enter GoHighLevel API key"
                          {...field}
                          disabled={isLoading}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant={testResults.ghl?.success ? "outline" : "outline"}
                          className={testResults.ghl?.success ? "bg-green-50 hover:bg-green-100 border-green-200" : ""}
                          onClick={() => testApiKey('ghl')}
                          disabled={isLoading || testingKeys.ghl}
                        >
                          {testingKeys.ghl ? "Testing..." : testResults.ghl?.success ? "Verified ✓" : "Test"}
                        </Button>
                      </div>
                    </FormControl>
                    {testResults.ghl && !testResults.ghl.success && (
                      <Alert variant="destructive" className="mt-2 py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm">Test Failed</AlertTitle>
                        <AlertDescription className="text-xs">
                          {testResults.ghl.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    {testResults.ghl && testResults.ghl.success && (
                      <Alert variant="default" className="mt-2 py-2 border-green-200 bg-green-50 text-green-800">
                        <AlertDescription className="text-xs flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> {testResults.ghl.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>IntakeQ API</CardTitle>
          <CardDescription>Configure your IntakeQ API key</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="intakeqApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder="Enter IntakeQ API key"
                          {...field}
                          disabled={isLoading}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant={testResults.intakeq?.success ? "outline" : "outline"}
                          className={testResults.intakeq?.success ? "bg-green-50 hover:bg-green-100 border-green-200" : ""}
                          onClick={() => testApiKey('intakeq')}
                          disabled={isLoading || testingKeys.intakeq}
                        >
                          {testingKeys.intakeq ? "Testing..." : testResults.intakeq?.success ? "Verified ✓" : "Test"}
                        </Button>
                      </div>
                    </FormControl>
                    {testResults.intakeq && !testResults.intakeq.success && (
                      <Alert variant="destructive" className="mt-2 py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm">Test Failed</AlertTitle>
                        <AlertDescription className="text-xs">
                          {testResults.intakeq.message}
                          {testResults.intakeq.message?.includes('HTML') && (
                            <p className="mt-1">This usually means your API key is invalid or IntakeQ is returning an error page instead of JSON.</p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                    {testResults.intakeq && testResults.intakeq.success && (
                      <Alert variant="default" className="mt-2 py-2 border-green-200 bg-green-50 text-green-800">
                        <AlertDescription className="text-xs flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> {testResults.intakeq.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="md:col-span-2 flex justify-end">
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save API Configuration'}
        </Button>
      </div>
    </div>
  );
};

export default WebhookConfig;
