import React, { useEffect, useState } from "react";
import NBAHeader from "../../components/nbaHeader";
import axios from "axios";
import "../../css/nbaHome.css";

const NBAHome = () => {
  const [articles, setArticles] = useState([]);
  const [dailyGames, setDailyGames] = useState([]);
  const [loading, setLoading] = useState(false); // Set to false initially to avoid premature loading states
  const [error, setError] = useState("");

  // Fetch News Articles
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("https://newsapi.org/v2/everything", {
          params: {
            q: "NBA",
            apiKey: "f57f4b4966f4492c85ae9591b2e0ecbb", // Replace with your valid API key
            language: "en",
            pageSize: 5,
          },
        });
        setArticles(response.data.articles);
      } catch (error) {
        console.error("Error fetching news articles:", error.message);
      }
    };

    fetchNews();
  }, []);


  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <NBAHeader />
      <div className="content">
        {/* Daily Games Section */}


        {/* News Section */}
        <div className="news-section">
          <h2>Latest NBA News</h2>
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <div key={index} className="news-card">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="news-image"
                    />
                  )}
                  <h3>{article.title}</h3>
                </a>
                <p>{article.description}</p>
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
