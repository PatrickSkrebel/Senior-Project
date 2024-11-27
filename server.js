import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
// server.js
app.get('/nba-standings', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.sportradar.com/nba/trial/v8/en/seasons/2024/REG/standings.json',
      {
        params: {
          api_key: 'IR2QSHcI7Ue4QgoE8dyx0Cw0mVXHKYEdoIhGJRME',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.message);
  }
});



app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
