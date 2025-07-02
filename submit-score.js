// api/submit-score.js
import { createClient } from '@supabase/supabase-js';

// Create a single Supabase client for interacting with your database
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests for submitting scores
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, score } = req.body;

    // Basic validation
    if (!name || typeof score !== 'number') {
      return res.status(400).json({ error: 'Invalid name or score provided.' });
    }
    if (name.length > 15) {
        return res.status(400).json({ error: 'Name is too long.' });
    }
    if (score < 0 || score > 25000) {
        return res.status(400).json({ error: 'Invalid score value.' });
    }

    // Insert the new score into the 'scores' table in your Supabase database
    const { data, error } = await supabase
      .from('scores')
      .insert([{ name, score }]);

    if (error) {
      throw error; // Let the catch block handle Supabase-specific errors
    }

    // Send a success response back to the game
    return res.status(201).json({ message: 'Score submitted successfully!', data });

  } catch (error) {
    // If anything goes wrong, log it on the server and send a generic error
    console.error('Error submitting score:', error.message);
    return res.status(500).json({ error: 'An internal error occurred.' });
  }
}