
// This file serves as a proxy API endpoint for Vite applications
// DEPRECATED: This endpoint is no longer in use. Use the Supabase Edge Function directly instead.

export default async function handler(req: Request): Promise<Response> {
  console.warn('The /api/proxy endpoint is deprecated. Please use the Supabase Edge Function directly.');
  
  return new Response(JSON.stringify({ 
    error: 'This API endpoint is deprecated. Please use the Supabase Edge Function directly.' 
  }), {
    status: 410, // Gone
    headers: { 'Content-Type': 'application/json' },
  });
}
