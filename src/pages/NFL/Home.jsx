import { useState, useEffect } from "react";
import Header from "../../components/mainHeader";
import "../../css/mainHome.css";
import axios from "axios";



const Home = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get<NewsApiResponse>(
          "https://newsapi.org/v2/everything",
          {
            params: {
              q: "NBA, MLB, NFL",
              apiKey: "f57f4b4966f4492c85ae9591b2e0ecbb",
              language: "en",
              pageSize: 5,
            },
          }
        );
        setArticles(response.data.articles);
      } catch (error) {
        console.error("Error fetching news articles:", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <div>
      <Header />

      <div className="page-layout">
        {/* Cards Section */}
        <div className="cards-section">
          <div className="card shadow">
            <h1 className="home-title">NBA</h1>
            <p className="card-text">
              <a href="https://example.com/league-leaders">League Leaders</a>
            </p>
            <p className="card-text">
              <a href="https://example.com/league-leaders">Standings</a>
            </p>
          </div>

          <div className="card shadow">
            <h1 className="home-title">MLB</h1>
            <p className="card-text">
              <a href="https://example.com/league-leaders">League Leaders</a>
            </p>
            <p className="card-text">
              <a href="https://example.com/league-leaders">Standings</a>
            </p>
          </div>

          <div className="card shadow">
            <h1 className="home-title">NFL</h1>
            <p className="card-text">
              <a href="https://example.com/league-leaders">League Leaders</a>
            </p>
            <p className="card-text">
              <a href="https://example.com/league-leaders">Standings</a>
            </p>
          </div>
        </div>

        {/* News Section */}
        <div className="news-section">
          <h1 className="home-title">Latest Sports News</h1>
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <div key={index} className="news-card">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {article.urlToImage ? (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="news-image"
                    />
                  ) : (
                    <div className="placeholder-image">No Image Available</div>
                  )}
                </a>
                <div className="news-content">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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

export default Home;
