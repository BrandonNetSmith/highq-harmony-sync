
import React from 'react';
import WebhookConfig from '@/components/WebhookConfig';
import SyncStatus from '@/components/SyncStatus';
import SyncActivity from '@/components/SyncActivity';

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">GoHighLevel ↔ IntakeQ Sync</h1>
        <p className="text-muted-foreground">
          Monitor and manage your integration between GoHighLevel and IntakeQ
        </p>
      </div>

      <div className="grid gap-8">
        <WebhookConfig />
        
        <div className="grid gap-8 md:grid-cols-2">
          <SyncStatus />
          <SyncActivity />
        </div>
      </div>
    </div>
  );
};

export default Index;
