
import React from 'react';
import { useWebhookConfig } from '@/hooks/use-webhook-config';
import ApiKeyConfigSection from './ApiKeyConfigSection';

const WebhookConfig = () => {
  const {
    form,
    isLoading,
    connectionError,
    testingKeys,
    testResults,
    testApiKey,
    onSubmit
  } = useWebhookConfig();

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
