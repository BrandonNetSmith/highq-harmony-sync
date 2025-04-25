
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { url, method, headers, body } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Proxying request to: ${url}`);

    const requestHeaders = new Headers();
    // Copy the headers from the request
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          requestHeaders.append(key, value);
        }
      });
    }

    // Set Content-Type if sending a body
    if (body && method !== 'GET' && !requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    const requestOptions: RequestInit = {
      method: method || 'GET',
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);
    const responseStatus = response.status;
    
    // Try to parse as JSON, but if it fails just return the text
    let responseData: any = {};
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // Check if the response is empty (content-length: 0 or no content)
    if (contentLength === '0' || responseStatus === 204) {
      responseData = { _empty: true };
    } else {
      try {
        // First try to get the response as text
        const responseText = await response.text();
        
        // If the response text is empty, return an empty object
        if (!responseText || responseText.trim() === '') {
          responseData = { _empty: true };
        } 
        // If it seems like JSON (starts with { or [), parse it
        else if ((responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) && 
                contentType && contentType.includes('application/json')) {
          try {
            responseData = JSON.parse(responseText);
          } catch (jsonError) {
            console.error('JSON parse error:', jsonError);
            responseData = { 
              text: responseText,
              _parseError: 'Failed to parse JSON response'
            };
          }
        } else {
          // Just return the text
          responseData = { text: responseText };
        }
      } catch (error) {
        console.error('Response processing error:', error);
        responseData = { 
          _error: 'Failed to process response',
          _errorDetails: error.message
        };
      }
    }

    // Add status code to the response for better error handling
    responseData._statusCode = responseStatus;
    
    // Add specific error messages for common authentication errors
    if (responseStatus === 401) {
      responseData._errorMessage = "Authentication failed. Your API key may be invalid or expired.";
    } else if (responseStatus === 403) {
      responseData._errorMessage = "Access forbidden. Your API key doesn't have permission to access this resource.";
    } else if (responseStatus === 404) {
      responseData._errorMessage = "Resource not found. The requested API endpoint doesn't exist.";
    }

    // Add the URL that was called (useful for debugging)
    responseData._requestUrl = url;

    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set('Content-Type', 'application/json');

    return new Response(JSON.stringify(responseData), {
      status: 200, // Always return 200 from the proxy and include the actual status in the response
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Proxy server error',
      _statusCode: 500
    }), {
      status: 200, // Return 200 but include error details and status code in body
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
