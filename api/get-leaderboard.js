// api/get-leaderboard.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Only allow GET requests for fetching the leaderboard
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // This is the database query:
    // 1. Select the name and score columns
    // 2. From the 'scores' table
    // 3. Where 'created_at' is greater than or equal to 7 days ago
    // 4. Order by score descending
    // 5. Limit to the top 10 results
    const { data, error } = await supabase
      .from('scores')
      .select('name, score')
      .gte('created_at', sevenDaysAgo.toISOString()) // .gte means "greater than or equal to"
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    // Send the leaderboard data back to the game
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    return res.status(500).json({ error: 'An internal error occurred.' });
  }
}
