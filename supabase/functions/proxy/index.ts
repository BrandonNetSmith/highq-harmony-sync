
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
    console.log(`Request method: ${method}`);
    console.log(`Request headers:`, headers);

    const requestHeaders = new Headers();
    // Copy the headers from the request
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          requestHeaders.append(key, value);
          console.log(`Added header: ${key}`);
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
      console.log(`Sending ${method || 'GET'} request to: ${url}`);
      response = await fetch(url, requestOptions);
      console.log(`Received response with status: ${response.status}`);
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
    console.log(`Response status code: ${responseStatus}`);
    
    // Try to parse as JSON, but if it fails just return the text
    let responseData: any = {};
    const contentType = response.headers.get('content-type');
    console.log(`Response content-type: ${contentType}`);
    
    const contentLength = response.headers.get('content-length');
    console.log(`Response content-length: ${contentLength}`);
    
    // Check if the response is empty (content-length: 0 or no content)
    if (contentLength === '0' || responseStatus === 204) {
      responseData = { 
        _empty: true,
        _statusCode: responseStatus,
        _requestUrl: url
      };
      console.log('Empty response detected');
    } else {
      try {
        // First try to get the response as text
        const responseText = await response.text();
        console.log(`Response text length: ${responseText.length}`);
        
        if (responseText.length > 0) {
          console.log(`Response text preview: ${responseText.substring(0, 50)}...`);
        }
        
        // If the response text is empty, return an empty object
        if (!responseText || responseText.trim() === '') {
          responseData = { 
            _empty: true,
            _statusCode: responseStatus,
            _requestUrl: url
          };
          console.log('Empty response text detected');
        } 
        // Special handling for HTML responses which are likely auth errors
        else if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          console.log('HTML response detected (likely an error page)');
          
          // Extract any useful information from the HTML
          let errorMessage = "Authentication failed or invalid endpoint";
          
          // Look for common patterns in error pages
          if (responseText.includes('401') || responseText.includes('Unauthorized')) {
            errorMessage = "401 Unauthorized - Invalid API key or credentials";
          } else if (responseText.includes('403') || responseText.includes('Forbidden')) {
            errorMessage = "403 Forbidden - Access denied";
          } else if (responseText.includes('404') || responseText.includes('Not Found')) {
            errorMessage = "404 Not Found - API endpoint does not exist";
          } else if (responseText.includes('Internal Server Error') || responseText.includes('500')) {
            errorMessage = "500 Internal Server Error - Server issue on the API provider side";
          }
          
          responseData = { 
            _error: errorMessage,
            _isHtml: true,
            _statusCode: responseStatus,
            _requestUrl: url,
            _htmlSnippet: responseText.substring(0, 500) + '...'
          };
        }
        // If it seems like JSON (starts with { or [), parse it
        else if ((responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) && 
                contentType && contentType.includes('application/json')) {
          try {
            responseData = JSON.parse(responseText);
            console.log('Successfully parsed JSON response');
          } catch (jsonError) {
            console.error('JSON parse error:', jsonError);
            responseData = { 
              _parseError: 'Failed to parse JSON response',
              _errorDetails: jsonError.message,
              _responsePreview: responseText.substring(0, 100) + '...',
              _statusCode: responseStatus,
              _requestUrl: url
            };
          }
        } else {
          // Just return the text for any other content type
          console.log('Non-JSON text response detected');
          responseData = { 
            text: responseText,
            _contentType: contentType || 'text/plain',
            _statusCode: responseStatus,
            _requestUrl: url
          };
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
      status: 200, // Return 200 but include error details in body
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
