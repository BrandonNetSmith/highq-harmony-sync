
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ApiErrorAlertProps {
  apiError: string;
  debugInfo?: any;
}

export const ApiErrorAlert = ({ apiError, debugInfo }: ApiErrorAlertProps) => {
  const isHtmlError = apiError.includes("HTML");
  const is404Error = apiError.includes("404");
  
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
          </>
        )}
        {is404Error && (
          <>
            <p className="mt-2 text-sm font-medium">
              The API endpoint was not found (404). This likely means:
            </p>
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>The IntakeQ API endpoint URL is incorrect</li>
              <li>IntakeQ has changed their API structure</li>
              <li>Your account may not have access to this API endpoint</li>
            </ul>
            <p className="mt-2 text-sm font-medium">
              We're attempting to connect to IntakeQ's v2 API. If you're using a legacy API key, you may need to upgrade.
            </p>
          </>
        )}
        {debugInfo && (
          <div className="mt-2 p-2 bg-gray-800 text-white rounded text-xs">
            <p>Debug info (for troubleshooting):</p>
            <p>Status: {debugInfo.statusCode}</p>
            <p>Content-Type: {debugInfo.contentType}</p>
            <p>IsHTML: {debugInfo.isHtml ? 'Yes' : 'No'}</p>
            <p>Parse Error: {debugInfo.hasParseError ? 'Yes' : 'No'}</p>
            <p>URL: {debugInfo.requestUrl}</p>
            {debugInfo.errorMessage && <p>Error Message: {debugInfo.errorMessage}</p>}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
