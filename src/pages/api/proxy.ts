
import type { NextApiRequest, NextApiResponse } from 'next';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).set(corsHeaders).end();
    return;
  }

  // Only allow POST requests for security reasons
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, method, headers: requestHeaders, body } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Proxying request to: ${url}`);
    console.log(`Request method: ${method}`);

    // Prepare request headers
    const fetchHeaders = new Headers();
    if (requestHeaders) {
      Object.entries(requestHeaders).forEach(([key, value]) => {
        if (typeof value === 'string' && !key.toLowerCase().includes('host')) {
          fetchHeaders.append(key, value);
        }
      });
    }

    // Create fetch options
    const fetchOptions: RequestInit = {
      method: method || 'GET',
      headers: fetchHeaders,
      redirect: 'manual',
    };

    if (body && method !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Execute the request
    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type');
    let responseData;

    // Process the response based on content type
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      
      // Check if the response is HTML (usually an error page)
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        responseData = {
          _isHtml: true,
          _statusCode: response.status,
          _errorMessage: `Received HTML response (status ${response.status})`
        };
      } else {
        try {
          // Try to parse as JSON anyway
          responseData = JSON.parse(text);
        } catch (e) {
          // If not JSON, return as text
          responseData = { text, _contentType: contentType };
        }
      }
    }

    // Add status code for client reference
    responseData = {
      ...responseData,
      _statusCode: response.status,
      _requestUrl: url
    };

    // Return the processed response
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Proxy server error',
      _statusCode: 500
    });
  }
}
