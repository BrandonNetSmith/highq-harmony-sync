
import React from 'react';
import { SyncConfigProvider } from '@/contexts/SyncConfigContext';
import SyncDashboardPage from './SyncDashboardPage';

const Index = () => {
  return (
    <SyncConfigProvider>
      <SyncDashboardPage />
    </SyncConfigProvider>
  );
};

export default Index;
