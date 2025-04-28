
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Request processing functions
const validateRequest = (method: string, url?: string) => {
  if (method !== 'POST') {
    return { error: 'Method not allowed', status: 405 };
  }
  if (!url) {
    return { error: 'URL is required', status: 400 };
  }
  return null;
};

const prepareRequestHeaders = (headers: Record<string, string> | undefined) => {
  const requestHeaders = new Headers();
  
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string' && !key.toLowerCase().includes('host')) {
        requestHeaders.append(key, value);
        console.log(`Added header: ${key}`);
      }
    });
  }
  return requestHeaders;
};

const createRequestOptions = (method: string, headers: Headers, body: any): RequestInit => {
  const options: RequestInit = {
    method: method || 'GET',
    headers,
    redirect: 'manual',
  };

  if (body && method !== 'GET') {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return options;
};

// Response processing functions
const processHtmlResponse = (responseText: string, responseStatus: number, url: string) => {
  let errorMessage = "Authentication failed or invalid endpoint";
  
  if (responseText.includes('401') || responseText.includes('Unauthorized')) {
    errorMessage = "401 Unauthorized - Invalid API key or credentials";
  } else if (responseText.includes('403') || responseText.includes('Forbidden')) {
    errorMessage = "403 Forbidden - Access denied";
  } else if (responseText.includes('404') || responseText.includes('Not Found')) {
    errorMessage = "404 Not Found - API endpoint does not exist";
  } else if (responseText.includes('Internal Server Error') || responseText.includes('500')) {
    errorMessage = "500 Internal Server Error - Server issue on the API provider side";
  }
  
  return {
    _error: errorMessage,
    _isHtml: true,
    _statusCode: responseStatus,
    _requestUrl: url,
    _htmlSnippet: responseText.substring(0, 500) + '...'
  };
};

const processRedirectResponse = (response: Response, url: string) => {
  const location = response.headers.get('location');
  return {
    _redirect: true,
    _location: location,
    _statusCode: response.status,
    _requestUrl: url,
    _message: "Redirect detected. This proxy does not follow redirects automatically."
  };
};

const processJsonResponse = (responseText: string, contentType: string | null, responseStatus: number, url: string) => {
  if (responseText.trim() === '') {
    return {
      _empty: true,
      _statusCode: responseStatus,
      _requestUrl: url
    };
  }

  if ((responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) && 
      (contentType?.includes('application/json') || !contentType)) {
    try {
      const parsedData = JSON.parse(responseText);
      console.log('Successfully parsed JSON response');
      return {
        ...parsedData,
        _statusCode: responseStatus,
        _requestUrl: url
      };
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      return {
        _parseError: 'Failed to parse JSON response',
        _errorDetails: jsonError.message,
        _rawResponse: responseText.substring(0, 1000),
        _responsePreview: responseText.substring(0, 100) + '...',
        _statusCode: responseStatus,
        _requestUrl: url
      };
    }
  }

  return {
    text: responseText,
    _contentType: contentType || 'text/plain',
    _statusCode: responseStatus,
    _requestUrl: url
  };
};

const addErrorMessage = (data: any, statusCode: number) => {
  if (statusCode === 401) {
    data._errorMessage = "Authentication failed. Your API key may be invalid or expired.";
  } else if (statusCode === 403) {
    data._errorMessage = "Access forbidden. Your API key doesn't have permission to access this resource.";
  } else if (statusCode === 404) {
    data._errorMessage = "Resource not found. The requested API endpoint doesn't exist.";
  } else if (statusCode >= 400 && statusCode < 500) {
    data._errorMessage = `Client error: HTTP ${statusCode}. Check your request parameters and authentication.`;
  } else if (statusCode >= 500) {
    data._errorMessage = `Server error: HTTP ${statusCode}. The API server encountered an internal error.`;
  }
  return data;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { url, method, headers, body } = await req.json();

    // Validate request
    const validationError = validateRequest(method, url);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError.error }), {
        status: validationError.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

    // Make request
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
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseStatus = response.status;
    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    console.log(`Response status code: ${responseStatus}`);
    console.log(`Response content-type: ${contentType}`);
    console.log(`Response text length: ${responseText.length}`);
    if (responseText.length > 0) {
      console.log(`Response text preview: ${responseText.substring(0, 100)}...`);
    }

    // Process response based on content
    let responseData;
    if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
      console.log('HTML response detected - likely an error page');
      responseData = processHtmlResponse(responseText, responseStatus, url);
    } else if (responseStatus >= 300 && responseStatus < 400) {
      console.log(`Detected redirect to: ${response.headers.get('location')}`);
      responseData = processRedirectResponse(response, url);
    } else {
      responseData = processJsonResponse(responseText, contentType, responseStatus, url);
    }

    // Add error messages if needed
    responseData = addErrorMessage(responseData, responseStatus);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Proxy server error',
      _statusCode: 500
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

