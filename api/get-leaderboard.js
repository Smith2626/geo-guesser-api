// api/get-leaderboard.js
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // --- FIX: Add CORS headers to allow requests from any domain ---
  // For better security, you could replace '*' with your actual website's domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle pre-flight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure the request method is GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Calculate the date 7 days ago to filter for weekly scores
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch the top 10 scores from the last 7 days from the 'scores' table
    const { data, error } = await supabase
      .from('scores')
      .select('name, score')
      .gte('created_at', sevenDaysAgo.toISOString()) // gte = "greater than or equal to"
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      throw error; // Let the catch block handle the error
    }

    // Send the leaderboard data back to the game
    return res.status(200).json(data);

  } catch (error) {
    // Log the error on the server and send a generic error message
    console.error('Error fetching leaderboard:', error.message);
    return res.status(500).json({ error: 'An internal error occurred while fetching scores.' });
  }
}
