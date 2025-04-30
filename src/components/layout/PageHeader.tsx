
import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
}

export const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="mb-8 border-b pb-6 text-center">
      <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground text-lg">
          {description}
        </p>
      )}
    </div>
  );
};
