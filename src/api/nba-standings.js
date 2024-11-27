import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios.get(
      'https://api.sportradar.com/nba/trial/v8/en/seasons/2024/REG/standings.json',
      {
        params: {
          api_key: 'IR2QSHcI7Ue4QgoE8dyx0Cw0mVXHKYEdoIhGJRME',
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
}
