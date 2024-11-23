import React, { useEffect, useState } from "react";
import NBAHeader from "../../components/nbaHeader";
import axios from "axios";
import "../../css/nbaHome.css";

const NBAHome = () => {
  const [articles, setArticles] = useState([]);

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

  return (
    <div>
      <NBAHeader />
      <h1 className="home-title">NBA Home Page</h1>
      <p className="home-text">This page will display all NBA news</p>

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
