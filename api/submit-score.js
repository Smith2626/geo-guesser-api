import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // --- FALLBACK CORS HEADERS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, score } = req.body;
    if (!name || typeof score !== 'number' || name.length > 15 || name.length < 1 || score < 0 || score > 25000) {
      return res.status(400).json({ error: 'Invalid data provided.' });
    }

    const { data, error } = await supabase
      .from('scores')
      .insert([{ name, score }]);

    if (error) throw error;
    return res.status(201).json({ message: 'Score submitted successfully!' });

  } catch (error) {
    console.error('Error submitting score:', error.message);
    return res.status(500).json({ error: 'An internal error occurred.' });
  }
}
