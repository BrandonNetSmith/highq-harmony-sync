
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ApiErrorAlertProps {
  apiError: string;
  debugInfo?: any;
}

export const ApiErrorAlert = ({ apiError, debugInfo }: ApiErrorAlertProps) => {
  const isHtmlError = apiError.includes("HTML");
  const is404Error = apiError.includes("404") || apiError.includes("No HTTP resource");
  const isNonJsonError = apiError.includes("JSON");
  const isFormsError = apiError.toLowerCase().includes("forms") || (debugInfo?.requestUrl && debugInfo.requestUrl.toLowerCase().includes("form"));
  const isQuestionnairesError = apiError.toLowerCase().includes("questionnaires") || (debugInfo?.requestUrl && debugInfo.requestUrl.toLowerCase().includes("questionnaire"));
  const isFormRelatedError = isFormsError || isQuestionnairesError;
  
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
        {is404Error && isFormRelatedError && (
          <>
            <p className="mt-2 text-sm font-medium">
              The forms API endpoint was not found (404). This likely means:
            </p>
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>IntakeQ might be using a different API URL structure or naming for forms</li>
              <li>Your API key might not have access to forms</li>
              <li>Forms might be called "questionnaires" in your account's API</li>
              <li>Your IntakeQ subscription level might not include API access to forms</li>
            </ul>
            <p className="mt-2 text-sm font-medium">
              For forms, try these alternative methods:
            </p>
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>Contact IntakeQ support for your account's specific forms API</li>
              <li>Use IntakeQ's web interface directly for form management</li>
            </ul>
          </>
        )}
        {is404Error && !isFormRelatedError && (
          <>
            <p className="mt-2 text-sm font-medium">
              The API endpoint was not found (404). This likely means:
            </p>
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>IntakeQ may be using a different API URL structure</li>
              <li>Your account may not have access to this API endpoint</li>
              <li>Check IntakeQ API documentation for the correct endpoints for your account type</li>
            </ul>
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
