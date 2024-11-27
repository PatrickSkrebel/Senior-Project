export default async function handler(req, res) {
    const API_KEY = 'f57f4b4966f4492c85ae9591b2e0ecbb'; // Use your API key
    const query = req.query.q || 'NBA, MLB, NFL';
  
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(
          query
        )}&language=en&pageSize=5&apiKey=${API_KEY}`
      );
  
      if (!response.ok) {
        return res
          .status(response.status)
          .json({ message: 'Error fetching news articles' });
      }
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  