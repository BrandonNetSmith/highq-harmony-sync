
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

    let response;
    try {
      response = await fetch(url, requestOptions);
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(JSON.stringify({
        _error: 'Network request failed',
        _errorDetails: fetchError.message,
        _statusCode: 0,
        _requestUrl: url
      }), {
        status: 200, // Return 200 but include error details in body
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const responseStatus = response.status;
    
    // Try to parse as JSON, but if it fails just return the text
    let responseData: any = {};
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // Check if the response is empty (content-length: 0 or no content)
    if (contentLength === '0' || responseStatus === 204) {
      responseData = { 
        _empty: true,
        _statusCode: responseStatus,
        _requestUrl: url
      };
    } else {
      try {
        // First try to get the response as text
        const responseText = await response.text();
        
        // If the response text is empty, return an empty object
        if (!responseText || responseText.trim() === '') {
          responseData = { 
            _empty: true,
            _statusCode: responseStatus,
            _requestUrl: url
          };
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
              _parseError: 'Failed to parse JSON response',
              _statusCode: responseStatus,
              _requestUrl: url
            };
          }
        } else {
          // Check if it's HTML
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            responseData = { 
              text: 'HTML response received (likely an error page)',
              _parseError: 'Received HTML instead of JSON. The API endpoint may be incorrect or there may be an authentication issue.',
              _isHtml: true,
              _statusCode: responseStatus,
              _requestUrl: url,
              // Include just a snippet of the HTML for debugging
              _htmlSnippet: responseText.substring(0, 500) + '...'
            };
          } else {
            // Just return the text
            responseData = { 
              text: responseText,
              _statusCode: responseStatus,
              _requestUrl: url
            };
          }
        }
      } catch (error) {
        console.error('Response processing error:', error);
        responseData = { 
          _error: 'Failed to process response',
          _errorDetails: error.message,
          _statusCode: responseStatus,
          _requestUrl: url
        };
      }
    }

    // Add status code to the response for better error handling if not already added
    if (!responseData._statusCode) {
      responseData._statusCode = responseStatus;
    }
    
    // Add specific error messages for common authentication errors
    if (responseStatus === 401) {
      responseData._errorMessage = "Authentication failed. Your API key may be invalid or expired.";
    } else if (responseStatus === 403) {
      responseData._errorMessage = "Access forbidden. Your API key doesn't have permission to access this resource.";
    } else if (responseStatus === 404) {
      responseData._errorMessage = "Resource not found. The requested API endpoint doesn't exist.";
    } else if (responseStatus >= 400 && responseStatus < 500) {
      responseData._errorMessage = `Client error: HTTP ${responseStatus}. Check your request parameters and authentication.`;
    } else if (responseStatus >= 500) {
      responseData._errorMessage = `Server error: HTTP ${responseStatus}. The API server encountered an internal error.`;
    }

    // Add the URL that was called (useful for debugging)
    responseData._requestUrl = url;

    // Add original content type for reference
    if (contentType) {
      responseData._contentType = contentType;
    }

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
