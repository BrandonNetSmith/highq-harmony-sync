
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

    // Execute the request with the exact URL provided by the client
    const result = await executeRequest(url, requestOptions);
    const response = result.response;
    const error = result.error;
    
    // Handle network errors
    if (error) {
      return createSuccessResponse(error);
    }
    
    // Process the response and return
    const responseData = await processResponse(response, url);
    
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
