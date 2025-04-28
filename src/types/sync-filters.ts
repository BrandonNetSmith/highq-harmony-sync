
export interface FilterConfig {
  contactIds: string[];
  tags: string[];
  status: string[];
}

export interface IntakeQFilters {
  clientIds: string[];
  formIds: string[];
  status: string[];
}

export interface SyncFiltersProps {
  ghlFilters: FilterConfig;
  intakeqFilters: IntakeQFilters;
  onGhlFiltersChange: (filters: FilterConfig) => void;
  onIntakeqFiltersChange: (filters: IntakeQFilters) => void;
  disabled?: boolean;
}
