import express from 'express';
import axios from 'axios';

const app = express();

app.get('/api/nba-standings', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.sportradar.com/nba/trial/v8/en/seasons/2024/REG/standings.json',
      { params: { api_key: 'IR2QSHcI7Ue4QgoE8dyx0Cw0mVXHKYEdoIhGJRME' } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching NBA standings:', error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Export the app as a handler for Vercel
export default app;
