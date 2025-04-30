
/**
 * Functions for handling and processing responses
 */

/**
 * Processes the response from the proxied request
 */
export const processResponse = async (response: Response, requestUrl: string) => {
  const headers = Object.fromEntries(response.headers.entries());
  const statusCode = response.status;
  const contentType = response.headers.get('Content-Type');
  
  console.log(`Response status code: ${statusCode}`);
  console.log(`Response content-type: ${contentType}`);
  
  // Check if the response is a redirect - shouldn't happen with redirect: 'follow'
  if ([301, 302, 307, 308].includes(statusCode)) {
    const location = response.headers.get('Location');
    console.log(`Detected redirect to: ${location}`);
    return {
      _redirect: true,
      _location: location,
      _statusCode: statusCode,
      _requestUrl: requestUrl,
      _message: "Redirect detected"
    };
  }

  // Check for error status codes
  if (statusCode >= 400) {
    try {
      const text = await response.text();
      console.log(`Response text length: ${text.length}`);
      console.log(`Response text (first 200 chars): ${text.substring(0, 200)}`);
      
      // Try to parse the text as JSON
      try {
        const json = JSON.parse(text);
        return {
          ...json,
          _statusCode: statusCode,
          _contentType: contentType,
          _headers: headers,
          _errorMessage: json.message || json.error || json.Message || `HTTP Error ${statusCode}`,
          _requestUrl: requestUrl
        };
      } catch (parseError) {
        // Not valid JSON, return as text with error info
        return {
          _error: `HTTP Error ${statusCode}: ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`,
          _statusCode: statusCode,
          _contentType: contentType,
          _headers: headers,
          _text: text,
          _errorMessage: `HTTP Error ${statusCode}`,
          _requestUrl: requestUrl
        };
      }
    } catch (readError) {
      return {
        _error: `Error reading response: ${readError instanceof Error ? readError.message : String(readError)}`,
        _statusCode: statusCode,
        _contentType: contentType,
        _headers: headers,
        _requestUrl: requestUrl
      };
    }
  }

  // Process successful responses
  try {
    // Check if the response is empty
    const clone = response.clone();
    const text = await clone.text();
    console.log(`Response text length: ${text.length}`);
    if (text.length > 0) {
      console.log(`Response text beginning: ${text.substring(0, 100)}`);
    }
    
    if (!text.trim()) {
      return {
        _empty: true,
        _statusCode: statusCode,
        _contentType: contentType,
        _headers: headers,
        _requestUrl: requestUrl
      };
    }
    
    // Check if the response is HTML
    const isHtml = contentType?.includes('text/html') || 
                  text.trim().startsWith('<!DOCTYPE') || 
                  text.trim().startsWith('<html');
    
    if (isHtml) {
      return {
        _isHtml: true,
        _statusCode: statusCode,
        _contentType: contentType,
        _headers: headers,
        _text: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
        _requestUrl: requestUrl
      };
    }
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      // Return the parsed JSON directly for successful responses
      return json;
    } catch (parseError) {
      // Return the parsing error and the first part of the text
      console.error(`JSON parse error for ${requestUrl}:`, parseError);
      console.error(`Response that couldn't be parsed:`, text.substring(0, 200));
      
      return {
        _parseError: parseError instanceof Error ? parseError.message : String(parseError),
        _statusCode: statusCode,
        _contentType: contentType,
        _headers: headers,
        _text: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
        _requestUrl: requestUrl
      };
    }
  } catch (error) {
    return {
      _error: `Error processing response: ${error instanceof Error ? error.message : String(error)}`,
      _statusCode: statusCode,
      _contentType: contentType,
      _headers: headers,
      _requestUrl: requestUrl
    };
  }
};
