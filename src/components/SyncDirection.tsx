
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Database } from "@/integrations/supabase/types";

type SyncDirection = Database["public"]["Enums"]["sync_direction"];

interface SyncDirectionProps {
  value: SyncDirection;
  onChange: (value: SyncDirection) => void;
  disabled?: boolean;
}

export const SyncDirection = ({ value, onChange, disabled }: SyncDirectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Direction</CardTitle>
        <CardDescription>Choose how data should flow between systems</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value}
          onValueChange={(val) => onChange(val as SyncDirection)}
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bidirectional" id="bidirectional" />
            <Label htmlFor="bidirectional">Bidirectional Sync</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one_way_ghl_to_intakeq" id="ghl-to-intakeq" />
            <Label htmlFor="ghl-to-intakeq">GoHighLevel → IntakeQ</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one_way_intakeq_to_ghl" id="intakeq-to-ghl" />
            <Label htmlFor="intakeq-to-ghl">IntakeQ → GoHighLevel</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
