
// This file serves as a proxy API endpoint for Vite applications

export default async function handler(req: Request): Promise<Response> {
  try {
    // Forward the request to our Supabase Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL environment variable is not defined');
    }
    
    const functionUrl = `${supabaseUrl}/functions/v1/proxy`;
    
    // Get the request body from the incoming request
    const requestBody = await req.json();

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the response is ok
    if (!response.ok) {
      console.error(`Proxy error: ${response.status} ${response.statusText}`);
      return new Response(JSON.stringify({ error: `Proxy error: ${response.status} ${response.statusText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
