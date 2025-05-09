
/**
 * Functions for handling and validating incoming requests
 */

/**
 * Validates that a URL is provided in the request
 */
export const validateRequest = (method: string, url?: string) => {
  // We now only validate that a URL is provided, not the method
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
        console.log(`Added header: ${key}: ${key === 'Authorization' ? '***redacted***' : value}`);
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
    // Always follow redirects automatically
    redirect: 'follow',
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
    console.log('Request headers:', [...options.headers.entries()].map(entry => 
      entry[0] === 'Authorization' ? ['Authorization', '***redacted***'] : entry
    ));
    
    // Make the actual request with timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 20000); // 20 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: abortController.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`Received response with status: ${response.status}`);
      return { response, error: null };
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Request timed out after 20 seconds:', url);
        return {
          response: null,
          error: {
            _error: 'Request timeout',
            _errorDetails: 'The request took too long to complete and was aborted',
            _statusCode: 408,
            _requestUrl: url
          }
        };
      }
      throw fetchError;
    }
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    return { 
      response: null, 
      error: {
        _error: 'Network request failed',
        _errorDetails: fetchError instanceof Error ? fetchError.message : String(fetchError),
        _statusCode: 0,
        _requestUrl: url
      }
    };
  }
};

/**
 * Converts API response data to a consistent format
 */
export const formatResponseData = (data: any) => {
  // If data is already an array, return it
  if (Array.isArray(data)) {
    return data;
  }
  
  // If data has a results or data property that is an array, return that
  if (data && Array.isArray(data.results)) {
    return data.results;
  }
  
  if (data && Array.isArray(data.data)) {
    return data.data;
  }
  
  if (data && Array.isArray(data.contacts)) {
    return data.contacts;
  }
  
  if (data && Array.isArray(data.items)) {
    return data.items;
  }
  
  // Otherwise, return the data as is
  return data;
};
