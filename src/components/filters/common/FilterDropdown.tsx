
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface FilterDropdownProps<T> {
  items: T[];
  selectedValue: string;
  displayProperty: keyof T;
  idProperty: keyof T;
  onSelect: (id: string, displayValue: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export function FilterDropdown<T extends Record<string, any>>({
  items,
  selectedValue,
  displayProperty,
  idProperty,
  onSelect,
  placeholder,
  disabled
}: FilterDropdownProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled || items.length === 0}>
        <Button variant="outline" className="w-full justify-between">
          <span className="truncate">{selectedValue || placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[200px] overflow-y-auto w-[300px]">
        {items.map((item) => (
          <DropdownMenuItem
            key={item[idProperty] as string}
            onSelect={() => {
              onSelect(
                item[idProperty] as string,
                item[displayProperty] as string
              );
            }}
          >
            {item[displayProperty] as string}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
