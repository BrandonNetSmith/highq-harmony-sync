
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, createErrorResponse, createSuccessResponse } from "./utils.ts";
import { validateRequest, prepareRequestHeaders, createRequestOptions, executeRequest } from "./requestHandlers.ts";
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

    // Execute request
    const { response, error } = await executeRequest(url, requestOptions);
    
    // Handle network errors
    if (error) {
      return createSuccessResponse(error);
    }

    // Process response
    const responseData = await processResponse(response!, url);
    return createSuccessResponse(responseData);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return createErrorResponse(error.message || 'Proxy server error', 200);
  }
});
