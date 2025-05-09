
import React from 'react';
import { SyncConfigProvider } from '@/contexts/sync-config';
import SyncDashboardPage from './SyncDashboardPage';

const Index = () => {
  return (
    <SyncConfigProvider>
      <SyncDashboardPage />
    </SyncConfigProvider>
  );
};

export default Index;
