
/**
 * Functions for handling and validating incoming requests
 */

/**
 * Validates that the request method is POST and a URL is provided
 */
export const validateRequest = (method: string, url?: string) => {
  if (method !== 'POST') {
    return { error: 'Method not allowed', status: 405 };
  }
  if (!url) {
    return { error: 'URL is required', status: 400 };
  }
  return null;
};

/**
 * Prepares request headers from the incoming request
 */
export const prepareRequestHeaders = (headers: Record<string, string> | undefined) => {
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

/**
 * Creates the options object for the fetch request
 */
export const createRequestOptions = (method: string, headers: Headers, body: any): RequestInit => {
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

/**
 * Executes the fetch request and handles network errors
 */
export const executeRequest = async (url: string, options: RequestInit) => {
  try {
    console.log(`Sending ${options.method || 'GET'} request to: ${url}`);
    const response = await fetch(url, options);
    console.log(`Received response with status: ${response.status}`);
    return { response, error: null };
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    return { 
      response: null, 
      error: {
        _error: 'Network request failed',
        _errorDetails: fetchError.message,
        _statusCode: 0,
        _requestUrl: url
      }
    };
  }
};
