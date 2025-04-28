
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IntakeQFieldSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const IntakeQFieldSelect = ({
  value,
  options,
  onChange,
  disabled
}: IntakeQFieldSelectProps) => {
  return (
    <div className="text-right">
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select IntakeQ field" />
        </SelectTrigger>
        <SelectContent>
          {options.map((field: string) => (
            <SelectItem key={field} value={field}>
              {field}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
