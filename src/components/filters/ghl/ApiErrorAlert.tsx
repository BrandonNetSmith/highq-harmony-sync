
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ApiErrorAlertProps {
  apiError: string;
}

export const ApiErrorAlert = ({ apiError }: ApiErrorAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>GoHighLevel API Error</AlertTitle>
      <AlertDescription>
        {apiError}
        {apiError.includes("401") && (
          <p className="mt-2 text-sm font-medium">
            Your API key may be invalid or expired. Please check your API key in the API Configuration section below.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};
