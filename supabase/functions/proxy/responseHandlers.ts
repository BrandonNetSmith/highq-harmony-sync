
/**
 * Functions for processing and formatting responses
 */

/**
 * Processes HTML responses, usually error pages
 */
export const processHtmlResponse = (responseText: string, responseStatus: number, url: string) => {
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

/**
 * Processes redirect responses
 */
export const processRedirectResponse = (response: Response, url: string) => {
  const location = response.headers.get('location');
  return {
    _redirect: true,
    _location: location,
    _statusCode: response.status,
    _requestUrl: url,
    _message: "Redirect detected. This proxy does not follow redirects automatically."
  };
};

/**
 * Processes JSON or text responses
 */
export const processJsonResponse = (responseText: string, contentType: string | null, responseStatus: number, url: string) => {
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

/**
 * Adds descriptive error messages based on status code
 */
export const addErrorMessage = (data: any, statusCode: number) => {
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

/**
 * Main response processing function that decides how to handle different response types
 */
export const processResponse = async (response: Response, url: string) => {
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
  return addErrorMessage(responseData, responseStatus);
};
