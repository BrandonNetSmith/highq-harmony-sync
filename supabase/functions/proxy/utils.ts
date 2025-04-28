
// Common utilities and constants for the proxy function

// CORS headers to be used across the function
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Creates a standard error response with CORS headers
 */
export const createErrorResponse = (message: string, status: number = 200) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

/**
 * Creates a standard success response with CORS headers
 */
export const createSuccessResponse = (data: any) => {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};
