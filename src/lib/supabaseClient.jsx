import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rrolkubksaqlkusokhcw.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyb2xrdWJrc2FxbGt1c29raGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NjE3NDksImV4cCI6MjA0NjEzNzc0OX0.C1bYh29tnq38wz7uLMZpLsKPRktG4OL39yR20sTa-jI'; // Replace with your anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;

// npx supabase gen types typescript --project-id rrolkubksaqlkusokhcw > src/database.types.ts