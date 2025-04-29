
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ApiErrorAlertProps {
  apiError: string;
  debugInfo?: any;
}

export const ApiErrorAlert = ({ apiError, debugInfo }: ApiErrorAlertProps) => {
  const isHtmlError = apiError.includes("HTML");
  
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>IntakeQ API Error</AlertTitle>
      <AlertDescription>
        {apiError}
        {isHtmlError && (
          <>
            <p className="mt-2 text-sm font-medium">
              The API is returning HTML instead of JSON. This likely means:
            </p>
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>Your API key is invalid or expired</li>
              <li>The IntakeQ API endpoint URL may have changed</li>
              <li>IntakeQ may be down or experiencing issues</li>
            </ul>
            <p className="mt-2 text-sm font-medium">
              Please check your API key in the API Configuration section below and try again.
            </p>
            {debugInfo && (
              <div className="mt-2 p-2 bg-gray-800 text-white rounded text-xs">
                <p>Debug info (for troubleshooting):</p>
                <p>Status: {debugInfo.statusCode}</p>
                <p>Content-Type: {debugInfo.contentType}</p>
                <p>IsHTML: {debugInfo.isHtml ? 'Yes' : 'No'}</p>
                <p>Parse Error: {debugInfo.hasParseError ? 'Yes' : 'No'}</p>
                <p>URL: {debugInfo.requestUrl}</p>
              </div>
            )}
          </>
        )}
      </AlertDescription>
    </Alert>
  );
};
