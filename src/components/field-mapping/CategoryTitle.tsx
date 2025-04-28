
import React from 'react';
import { AccordionTrigger } from "@/components/ui/accordion";

interface CategoryTitleProps {
  label: string;
  position: 'left' | 'right';
}

export const CategoryTitle = ({ label, position }: CategoryTitleProps) => {
  if (position === 'right') {
    return (
      <div className="p-4 flex justify-end items-center">
        <div className="text-lg font-medium capitalize text-right">{label}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <AccordionTrigger className="hover:no-underline w-full text-left">
        <h3 className="text-lg font-medium capitalize text-left">{label}</h3>
      </AccordionTrigger>
    </div>
  );
};
