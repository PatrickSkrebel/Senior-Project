import React, { useEffect, useState } from "react";
import NBAHeader from "../../components/nbaHeader";
import axios from "axios";
import "../../css/nbaHome.css";

const NBAHome = () => {
  const [articles, setArticles] = useState([]);
  const [dailyGames, setDailyGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("https://newsapi.org/v2/everything", {
          params: {
            q: "NBA", // Search term for sports news
            apiKey: "f57f4b4966f4492c85ae9591b2e0ecbb", // Replace with your News API key
            language: "en",
            pageSize: 5, // Limit to 5 articles
          },
        });
        setArticles(response.data.articles);
      } catch (error) {
        console.error("Error fetching news articles:", error);
      }
    };

    fetchNews();
  }, []);


  useEffect(() => {
    const fetchDailyGames = async () => {
      const today = new Date(); // Get today's date
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      try {
        const response = await axios.get('http://localhost:5000/api/nba-daily-games', {
          params: { year, month, day },
        });
        setDailyGames(response.data.games || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching NBA daily games:", error.message);
        setError('Failed to fetch NBA daily games');
        setLoading(false);
      }
    };

    fetchDailyGames();
  }, []);

  if (loading) return <p>Loading daily games...</p>;
  if (error) return <p>{error}</p>;

  const fetchBoxscore = async (gameId) => {
    try {
      const response = await axios.get('http://localhost:5000/api/nba-game-boxscore', {
        params: { gameId },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching game boxscore:", error.message);
    }
  };

  return (
    <div>
      <NBAHeader />
      <div>

      <div className="games-container">
        {dailyGames.map((game) => (
          <div key={game.id} className="game-card">
            <div className="team-info">
              <p>{game.away.alias} <strong>{game.away_points ?? '-'}</strong></p>
              <p>vs</p>
              <p>{game.home.alias} <strong>{game.home_points ?? '-'}</strong></p>
            </div>
            <p className="game-status">{game.status}</p>
          </div>
        ))}
      </div>
    </div>

      <div className="page-layout">
        {/* Cards Section */}
        <div className="cards-section">
          <div className="card shadow">
            <h1 className="home-title">NBA</h1>
            <p className="card-text">
              <a href="https://example.com/league-leaders">League Leaders</a>
            </p>
            <p className="card-text">
              <a href="https://example.com/standings">Standings</a>
            </p>
          </div>

          <div className="card shadow">
            <h1 className="home-title">NBA</h1>
            <p className="card-text">
              <a href="https://example.com/league-leaders">League Leaders</a>
            </p>
            <p className="card-text">
              <a href="https://example.com/standings">Standings</a>
            </p>
          </div>

          <div className="card shadow">
            <h1 className="home-title">NBA</h1>
            <p className="card-text">
              <a href="https://example.com/league-leaders">League Leaders</a>
            </p>
            <p className="card-text">
              <a href="https://example.com/standings">Standings</a>
            </p>
          </div>
        </div>

        {/* News Section */}
        <div className="news-section">
          <h1 className="home-title">Latest Sports News</h1>
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <div key={index} className="news-card">
                <a href={article.url}>
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="news-image"
                    />
                  )}
                </a>
                <div className="news-content">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <h3 className="news-title">{article.title}</h3>
                  </a>
                  <p className="news-description">{article.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Loading news articles...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NBAHome;
