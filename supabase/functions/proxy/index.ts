
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, createErrorResponse, createSuccessResponse } from "./utils.ts";
import { validateRequest, prepareRequestHeaders, createRequestOptions, executeRequest, formatResponseData } from "./requestHandlers.ts";
import { processResponse } from "./responseHandlers.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse request body
    const { url, method, headers, body } = await req.json();

    // Validate request
    const validationError = validateRequest(method, url);
    if (validationError) {
      return createErrorResponse(validationError.error, validationError.status);
    }

    console.log(`Proxying request to: ${url}`);
    console.log(`Request method: ${method}`);
    console.log(`Request headers:`, headers);

    // Prepare request
    const requestHeaders = prepareRequestHeaders(headers);
    if (body && method !== 'GET' && !requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }
    const requestOptions = createRequestOptions(method, requestHeaders, body);

    // For IntakeQ, ensure we try v1 API first (v2 often gives 404s)
    let currentUrl = url;
    if (url.includes('intakeq.com/api/v2/')) {
      currentUrl = url.replace('/api/v2/', '/api/v1/');
      console.log(`Converting IntakeQ v2 API to v1: ${currentUrl}`);
    }

    // Execute request with automatic redirect handling
    const { response, error } = await executeRequest(currentUrl, requestOptions);
    
    // Handle network errors
    if (error) {
      return createSuccessResponse(error);
    }
    
    // Process the response and return
    const responseData = await processResponse(response, currentUrl);
    
    // If the response is in a nested format like data.results[], flatten it
    if (responseData && !responseData._error && !responseData._statusCode) {
      const formattedData = formatResponseData(responseData);
      return createSuccessResponse(formattedData);
    }
    
    return createSuccessResponse(responseData);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return createErrorResponse(error instanceof Error ? error.message : String(error), 200);
  }
});
