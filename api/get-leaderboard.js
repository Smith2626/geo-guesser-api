import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // --- FALLBACK CORS HEADERS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('scores')
      .select('name, score')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('score', { ascending: false })
      .limit(10);

    if (error) throw error;
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    return res.status(500).json({ error: 'An internal error occurred.' });
  }
}
