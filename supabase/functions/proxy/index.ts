
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

    // For IntakeQ API calls, try different API versions if needed
    let currentUrl = url;
    let response = null;
    let error = null;
    
    // Handle IntakeQ API version detection
    if (url.includes('intakeq.com/api/')) {
      // Try v1 API first as it's more stable
      if (url.includes('/api/v2/')) {
        currentUrl = url.replace('/api/v2/', '/api/v1/');
        console.log(`First attempt with IntakeQ v1 API: ${currentUrl}`);
        
        const result = await executeRequest(currentUrl, requestOptions);
        response = result.response;
        error = result.error;
        
        // If v1 fails with 404, fall back to v2
        if (response && response.status === 404) {
          console.log(`v1 API returned 404, falling back to v2: ${url}`);
          const v2Result = await executeRequest(url, requestOptions);
          response = v2Result.response;
          error = v2Result.error;
        }
      } else {
        // Already using v1 API, try it first
        const result = await executeRequest(url, requestOptions);
        response = result.response;
        error = result.error;
        
        // If v1 fails with 404, try v2
        if (response && response.status === 404) {
          const v2Url = url.replace('/api/v1/', '/api/v2/');
          console.log(`v1 API returned 404, trying v2: ${v2Url}`);
          const v2Result = await executeRequest(v2Url, requestOptions);
          response = v2Result.response;
          error = v2Result.error;
        }
      }
    } else {
      // Non-IntakeQ request, execute directly
      const result = await executeRequest(url, requestOptions);
      response = result.response;
      error = result.error;
    }
    
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
