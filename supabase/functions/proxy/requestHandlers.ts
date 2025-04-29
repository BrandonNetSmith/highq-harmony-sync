
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
    console.log('Request headers:', [...options.headers.entries()]);
    
    // Make the actual request
    const response = await fetch(url, options);
    console.log(`Received response with status: ${response.status}`);
    
    // If the endpoint is IntakeQ and returns a 404 for v1 or v2, try other version
    if (url.includes('intakeq.com/api/') && response.status === 404) {
      // Check if we're using v1 or v2
      const isV1 = url.includes('/api/v1/');
      const isV2 = url.includes('/api/v2/');
      
      if (isV1 || isV2) {
        // Try the other version by replacing v1 with v2 or vice versa
        const alternateUrl = isV1 
          ? url.replace('/api/v1/', '/api/v2/') 
          : url.replace('/api/v2/', '/api/v1/');
          
        console.log(`IntakeQ API version error. Attempting alternate API version: ${alternateUrl}`);
        
        const alternateResponse = await fetch(alternateUrl, options);
        console.log(`Alternate endpoint response status: ${alternateResponse.status}`);
        
        if (alternateResponse.status !== 404) {
          // The alternate version worked, return this response
          return { response: alternateResponse, error: null };
        }
        
        // If both versions failed with 404, continue with the original response
      }
    }
    
    return { response, error: null };
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
  
  // Otherwise, return the data as is
  return data;
};
