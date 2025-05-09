
import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FieldMapping } from '@/components/field-mapping/FieldMapping';
import { SyncFilters } from '@/components/SyncFilters';
import WebhookConfig from '@/components/WebhookConfig';
import SyncStatus from '@/components/SyncStatus';
import SyncActivity from '@/components/SyncActivity';
import { useSyncConfig } from '@/contexts/sync-config';

const SyncDashboardPage = () => {
  const {
    syncConfig,
    isLoading,
    handleFiltersChange,
    handleFieldMappingChange
  } = useSyncConfig();

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader 
        title={<>GoHighLevel <span className="inline-block mx-1">↔</span> IntakeQ Sync</>}
        description="Monitor and manage your integration between GoHighLevel and IntakeQ"
      />

      <div className="grid gap-8">
        <FieldMapping
          fieldMapping={syncConfig.field_mapping}
          onChange={handleFieldMappingChange}
          disabled={isLoading}
        />
        
        <SyncFilters
          ghlFilters={syncConfig.ghl_filters}
          intakeqFilters={syncConfig.intakeq_filters}
          onGhlFiltersChange={(filters) => handleFiltersChange('ghl', filters)}
          onIntakeqFiltersChange={(filters) => handleFiltersChange('intakeq', filters)}
          disabled={isLoading}
        />
        
        <WebhookConfig />
        
        <div className="grid gap-8 md:grid-cols-2">
          <SyncStatus />
          <SyncActivity />
        </div>
      </div>
    </div>
  );
};

export default SyncDashboardPage;
