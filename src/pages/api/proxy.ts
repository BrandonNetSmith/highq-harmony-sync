
import { NextApiRequest, NextApiResponse } from 'next';

// This file serves as a proxy API endpoint for Vite applications

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Forward the request to our Supabase Edge Function
    const { supabaseUrl } = process.env;
    const functionUrl = `${supabaseUrl}/functions/v1/proxy`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal proxy error' });
  }
}
