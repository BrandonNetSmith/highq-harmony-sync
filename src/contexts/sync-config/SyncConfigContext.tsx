
import React, { createContext, useContext } from 'react';
import type { SyncConfigContextType } from './types';

const SyncConfigContext = createContext<SyncConfigContextType | undefined>(undefined);

export const useSyncConfig = () => {
  const context = useContext(SyncConfigContext);
  if (!context) {
    throw new Error('useSyncConfig must be used within a SyncConfigProvider');
  }
  return context;
};

export { SyncConfigContext };
