
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

    // Execute request with redirect handling
    let currentUrl = url;
    let redirectCount = 0;
    const MAX_REDIRECTS = 5;
    
    while (redirectCount < MAX_REDIRECTS) {
      // Execute request
      const { response, error } = await executeRequest(currentUrl, requestOptions);
      
      // Handle network errors
      if (error) {
        return createSuccessResponse(error);
      }
      
      // Check for redirect
      if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
        const location = response.headers.get('Location');
        if (location) {
          console.log(`Following redirect ${redirectCount + 1} to: ${location}`);
          currentUrl = location;
          redirectCount++;
          // Continue to the next iteration of the loop to follow the redirect
          continue;
        }
      }
      
      // If we reach here, it's not a redirect or we couldn't follow it
      // Process the response and return
      const responseData = await processResponse(response, currentUrl);
      return createSuccessResponse(responseData);
    }
    
    // If we reached the maximum number of redirects
    return createErrorResponse(`Exceeded maximum number of redirects (${MAX_REDIRECTS})`, 200);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return createErrorResponse(error.message || 'Proxy server error', 200);
  }
});
