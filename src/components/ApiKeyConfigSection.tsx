
import React, { useState } from 'react';
import { UseFormReturn } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info } from 'lucide-react';
import ApiKeyTestCard from './ApiKeyTestCard';

interface ApiConfigForm {
  ghlApiKey: string;
  intakeqApiKey: string;
}

interface TestResult {
  success: boolean;
  message: string | null;
}

interface ApiKeyConfigSectionProps {
  form: UseFormReturn<ApiConfigForm>;
  isLoading: boolean;
  connectionError: string | null;
  onSubmit: (data: ApiConfigForm) => Promise<void>;
  onTestApiKey: (type: 'ghl' | 'intakeq') => Promise<void>;
  testingKeys: { ghl: boolean; intakeq: boolean };
  testResults: {
    ghl: TestResult | null;
    intakeq: TestResult | null;
  };
}

const ApiKeyConfigSection = ({
  form,
  isLoading,
  connectionError,
  onSubmit,
  onTestApiKey,
  testingKeys,
  testResults
}: ApiKeyConfigSectionProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {connectionError && (
        <div className="md:col-span-2 bg-destructive/15 p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="text-destructive h-5 w-5" />
          <p className="text-destructive">{connectionError}</p>
        </div>
      )}
      
      <Alert className="md:col-span-2 mb-2" variant="default">
        <Info className="h-4 w-4" />
        <AlertTitle>API Connection Status</AlertTitle>
        <AlertDescription>
          The proxy function is used to securely connect to external APIs. If the test fails, please check the Edge Function logs.
        </AlertDescription>
      </Alert>

      <ApiKeyTestCard
        title="GoHighLevel"
        description="Configure your GoHighLevel API key"
        fieldName="ghlApiKey"
        form={form}
        isLoading={isLoading}
        isTesting={testingKeys.ghl}
        testResult={testResults.ghl}
        onTest={() => onTestApiKey('ghl')}
      />

      <ApiKeyTestCard
        title="IntakeQ"
        description="Configure your IntakeQ API key"
        fieldName="intakeqApiKey"
        form={form}
        isLoading={isLoading}
        isTesting={testingKeys.intakeq}
        testResult={testResults.intakeq}
        onTest={() => onTestApiKey('intakeq')}
      />

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

export default ApiKeyConfigSection;
