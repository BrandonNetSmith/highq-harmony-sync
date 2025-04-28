
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { UseFormReturn } from "react-hook-form";

interface TestResult {
  success: boolean;
  message: string | null;
}

interface ApiKeyTestCardProps {
  title: string;
  description: string;
  fieldName: 'ghlApiKey' | 'intakeqApiKey';
  form: UseFormReturn<any>;
  isLoading: boolean;
  isTesting: boolean;
  testResult: TestResult | null;
  onTest: () => void;
}

const ApiKeyTestCard = ({
  title,
  description,
  fieldName,
  form,
  isLoading,
  isTesting,
  testResult,
  onTest
}: ApiKeyTestCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder={`Enter ${title} API key`}
                    {...field}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant={testResult?.success ? "outline" : "outline"}
                    className={testResult?.success ? "bg-green-50 hover:bg-green-100 border-green-200" : ""}
                    onClick={onTest}
                    disabled={isLoading || isTesting}
                  >
                    {isTesting ? "Testing..." : testResult?.success ? "Verified ✓" : "Test"}
                  </Button>
                </div>
              </FormControl>
              {testResult && !testResult.success && (
                <Alert variant="destructive" className="mt-2 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Test Failed</AlertTitle>
                  <AlertDescription className="text-xs">
                    {testResult.message}
                    {testResult.message?.includes('HTML') && (
                      <p className="mt-1">This usually means your API key is invalid or the service is returning an error page instead of JSON.</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              {testResult && testResult.success && (
                <Alert variant="default" className="mt-2 py-2 border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs flex items-center">
                    {testResult.message}
                  </AlertDescription>
                </Alert>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default ApiKeyTestCard;
