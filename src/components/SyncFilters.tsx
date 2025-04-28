
import React from 'react';
import { GHLFilterCard } from './filters/GHLFilterCard';
import { IntakeQFilterCard } from './filters/IntakeQFilterCard';
import { SyncFiltersProps } from '@/types/sync-filters';
import { useFilterData } from '@/hooks/use-filter-data';

export const SyncFilters = ({
  ghlFilters,
  intakeqFilters,
  onGhlFiltersChange,
  onIntakeqFiltersChange,
  disabled
}: SyncFiltersProps) => {
  const {
    isLoadingGHL,
    isLoadingIntakeQ,
    availableTags,
    availableStatuses,
    availableForms,
    availableClients,
    ghlApiError,
    intakeqApiError,
    intakeqDebugInfo,
    handleFetchGHLData,
    handleFetchIntakeQData
  } = useFilterData();

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <GHLFilterCard
          filters={ghlFilters}
          onFiltersChange={onGhlFiltersChange}
          isLoading={isLoadingGHL}
          apiError={ghlApiError}
          availableTags={availableTags}
          availableStatuses={availableStatuses}
          onFetchData={handleFetchGHLData}
          disabled={disabled}
        />

        <IntakeQFilterCard
          filters={intakeqFilters}
          onFiltersChange={onIntakeqFiltersChange}
          isLoading={isLoadingIntakeQ}
          apiError={intakeqApiError}
          availableForms={availableForms}
          availableClients={availableClients}
          onFetchData={handleFetchIntakeQData}
          disabled={disabled}
          debugInfo={intakeqDebugInfo}
        />
      </div>
    </div>
  );
};
