// api/submit-score.js
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // --- FIX: Add CORS headers to allow requests from any domain ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-control-allow-headers', 'Content-Type');

  // Handle pre-flight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, score } = req.body;

    // --- Server-side validation ---
    if (!name || typeof score !== 'number') {
      return res.status(400).json({ error: 'Invalid name or score provided.' });
    }
    // Simple validation for name length and score range
    if (name.length > 15 || name.length < 1) {
        return res.status(400).json({ error: 'Name must be between 1 and 15 characters.' });
    }
    if (score < 0 || score > 25000) {
        return res.status(400).json({ error: 'Invalid score value provided.' });
    }
    // NOTE: A profanity filter could be added here later if needed

    // Insert the new score record into the 'scores' table
    const { data, error } = await supabase
      .from('scores')
      .insert([{ name, score }])
      .select(); // .select() is good practice to get the inserted data back

    if (error) {
      throw error; // Let the catch block handle Supabase errors
    }

    // Send a success response back to the game
    return res.status(201).json({ message: 'Score submitted successfully!', data });

  } catch (error) {
    // If anything goes wrong, log it and send a generic error
    console.error('Error submitting score:', error.message);
    return res.status(500).json({ error: 'An internal error occurred while submitting the score.' });
  }
}
