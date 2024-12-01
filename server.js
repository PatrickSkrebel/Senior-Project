import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 5000;

const api_key = 'IR2QSHcI7Ue4QgoE8dyx0Cw0mVXHKYEdoIhGJRME';

app.use(cors()); // Allow all origins (for development)

// Endpoint for NBA standings
app.get('/api/nba-standings', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.sportradar.com/nba/trial/v8/en/seasons/2024/REG/standings.json',
      {
        params: { api_key: api_key  },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching NBA standings:', error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Endpoint for NBA league leaders
app.get('/api/nba-leaders', async (req, res) => {
  const perMode = req.query.per_mode || 'total'; // Default to "total" if not specified

  try {
    const response = await axios.get(
      'https://api.sportradar.com/nba/trial/v8/en/seasons/2024/REG/leaders.json',
      {
        params: {
          api_key: api_key,
          per_mode: perMode,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching NBA leaders:', error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// Endpoint for NBA daily games schedule
app.get('/api/nba-daily-games', async (req, res) => {
  const { year, month, day } = req.query; // Pass date parameters dynamically
  try {
    const response = await axios.get(
      `https://api.sportradar.com/nba/trial/v8/en/games/${year}/${month}/${day}/schedule.json`,
      { params: { api_key: api_key } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching NBA daily games:', error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Endpoint for NBA game boxscore
app.get('/api/nba-game-boxscore', async (req, res) => {
  const { gameId } = req.query; // Pass game ID dynamically
  try {
    const response = await axios.get(
      `https://api.sportradar.com/nba/trial/v8/en/games/${gameId}/boxscore.json`,
      { params: { api_key: api_key } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching NBA game boxscore:', error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
