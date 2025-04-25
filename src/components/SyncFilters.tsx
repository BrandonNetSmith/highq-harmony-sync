
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FilterConfig {
  contactIds: string[];
  tags: string[];
  status: string[];
}

interface SyncFiltersProps {
  ghlFilters: FilterConfig;
  intakeqFilters: {
    clientIds: string[];
    formIds: string[];
    status: string[];
  };
  onGhlFiltersChange: (filters: FilterConfig) => void;
  onIntakeqFiltersChange: (filters: any) => void;
  disabled?: boolean;
}

export const SyncFilters = ({
  ghlFilters,
  intakeqFilters,
  onGhlFiltersChange,
  onIntakeqFiltersChange,
  disabled
}: SyncFiltersProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>GoHighLevel Filters</CardTitle>
          <CardDescription>Filter which GHL records to sync</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ghl-contact-ids">Contact IDs (comma-separated)</Label>
            <Input
              id="ghl-contact-ids"
              value={ghlFilters.contactIds.join(',')}
              onChange={(e) => onGhlFiltersChange({
                ...ghlFilters,
                contactIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
              })}
              placeholder="Enter contact IDs for testing"
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="ghl-tags">Tags (comma-separated)</Label>
            <Input
              id="ghl-tags"
              value={ghlFilters.tags.join(',')}
              onChange={(e) => onGhlFiltersChange({
                ...ghlFilters,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              })}
              placeholder="Enter tags to filter"
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IntakeQ Filters</CardTitle>
          <CardDescription>Filter which IntakeQ records to sync</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="intakeq-client-ids">Client IDs (comma-separated)</Label>
            <Input
              id="intakeq-client-ids"
              value={intakeqFilters.clientIds.join(',')}
              onChange={(e) => onIntakeqFiltersChange({
                ...intakeqFilters,
                clientIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
              })}
              placeholder="Enter client IDs for testing"
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="intakeq-form-ids">Form IDs (comma-separated)</Label>
            <Input
              id="intakeq-form-ids"
              value={intakeqFilters.formIds.join(',')}
              onChange={(e) => onIntakeqFiltersChange({
                ...intakeqFilters,
                formIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
              })}
              placeholder="Enter form IDs to filter"
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
