
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
  const isNonJsonError = apiError.includes("JSON");
  
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
              <li>IntakeQ requires an X-Auth-Key header instead of a Bearer token</li>
            </ul>
          </>
        )}
        {is404Error && (
          <>
            <p className="mt-2 text-sm font-medium">
              The API endpoint was not found (404). This likely means:
            </p>
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>IntakeQ may be using a different API path structure than expected</li>
              <li>Your account may not have access to this API endpoint</li>
              <li>The API version (v1 or v2) may be incorrect for your account</li>
            </ul>
            <p className="mt-2 text-sm font-medium">
              Please check with IntakeQ support about the correct API endpoints for your account.
            </p>
          </>
        )}
        {isNonJsonError && (
          <>
            <p className="mt-2 text-sm font-medium">
              The API is not returning valid JSON. This likely means:
            </p>
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>The API key might not have the correct permissions</li>
              <li>The API endpoint might be returning a different format than expected</li>
            </ul>
          </>
        )}
        {debugInfo && (
          <div className="mt-2 p-2 bg-gray-800 text-white rounded text-xs overflow-auto max-h-40">
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
