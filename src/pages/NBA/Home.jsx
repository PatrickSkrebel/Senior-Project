import React, { useEffect, useState } from "react";
import NBAHeader from "../../components/nbaHeader";
import axios from "axios";
import "../../css/nbaHome.css";

const NBAHome = () => {
  const [liveGames, setLiveGames] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newsArticles, setNewsArticles] = useState([]);

  // Fetch NBA News
  const fetchNBANews = async () => {
    try {
      const response = await axios.get("https://nba-latest-news.p.rapidapi.com/articles", {
        headers: {
          "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
          "x-rapidapi-host": "nba-latest-news.p.rapidapi.com",
        },
      });
      setNewsArticles(response.data);
    } catch (err) {
      console.error("Failed to load news articles:", err.message);
      setError("Failed to Load Articles");
    }
  };

  // Fetch Live Games
  const fetchLiveGames = async (date) => {
    setLoading(true);
    setError(""); // Clear previous errors
    try {
      const formattedDate = date.toISOString().split("T")[0];

      // Fetch games for the specified date
      const response = await axios.get("https://api-nba-v1.p.rapidapi.com/games", {
        params: { season: "2024" },
        headers: {
          "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
          "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
        },
      });

      if (response.status !== 200) {
        throw new Error(`Unexpected response code: ${response.status}`);
      }

      // Log the raw API response for debugging
      console.log("Raw API Response:", response.data);

      // Filter games for the selected date
      const gamesForSelectedDate = response.data.response.filter((game) => {
        const gameDateUTC = new Date(game.date.start);
        const gameDateLocal = new Date(
          gameDateUTC.getTime() + gameDateUTC.getTimezoneOffset() * 60000
        );

        // Log comparison for debugging
        console.log("Game Date:", gameDateLocal, "Selected Date:", formattedDate);

        return gameDateLocal.toISOString().split("T")[0] === formattedDate;
      });

      setLiveGames(gamesForSelectedDate);
    } catch (err) {
      console.error("Error fetching live games:", err.message || err);
      setError("Failed to load live games. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNBANews();
    fetchLiveGames(currentDate);

    const interval = setInterval(() => {
      fetchLiveGames(currentDate);
    }, 300000);

    return () => clearInterval(interval);
  }, [currentDate]);

  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    setCurrentDate(selectedDate);
  };

  const handlePreviousDay = () => {
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    setCurrentDate(previousDate);
  };

  const handleNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
  };

  const getDateOptions = () => {
    const options = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date();
      date.setDate(currentDate.getDate() + i);
      options.push(date);
    }
    return options;
  };

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div>
        <NBAHeader />

        {/* Date Dropdown 
        <div className="date-dropdown">
          <label htmlFor="date-select">Select Date: </label>
          <select
            id="date-select"
            value={currentDate.toISOString().split("T")[0]}
            onChange={handleDateChange}
          >
            {getDateOptions().map((date) => (
              <option key={date.toISOString()} value={date.toISOString().split("T")[0]}>
                {date.toDateString()}
              </option>
            ))}
          </select>
        </div>
        */}
        {/* Live Games */}
        <div className="live-games-wrapper">
          <button className="arrow-button left-arrow" onClick={handlePreviousDay}>
            &#8592;
          </button>
          <div className="live-games-row">
            {loading ? (
              <p>Loading games...</p>
            ) : liveGames.length > 0 ? (
              liveGames.map((game) => {
                const visitorScores = game.scores.visitors.linescore || ["-", "-", "-", "-"];
                const homeScores = game.scores.home.linescore || ["-", "-", "-", "-"];

                return (
                  <div key={game.id} className="game-card-horizontal">
                    <div className="team-row-horizontal">
                      <img src={game.teams.visitors.logo} className="team-logo" />
                      <span className="team-abbreviation">{game.teams.visitors.code}</span>
                      <div className="team-quarters">
                          <span>{getFormattedDate(game.date.start)}</span>
                        <div className="quarters-label">
                          <span>Q1</span>
                          <span>Q2</span>
                          <span>Q3</span>
                          <span>Q4</span>
                        </div>
                        <div className="quarters-scores">
                          <span>{visitorScores[0]}</span>
                          <span>{visitorScores[1]}</span>
                          <span>{visitorScores[2]}</span>
                          <span>{visitorScores[3]}</span>                          
                        </div>                        
                      </div>
                      <span className="team-visitor-score">{game.scores.visitors.points}</span>
                    </div>                    
                    <div className="team-row-horizontal">
                      <img src={game.teams.home.logo} alt={game.teams.home.name} className="team-logo" />
                      <span className="team-abbreviation">{game.teams.home.code}</span>
                      <div className="team-quarters">
                        <div className="quarters-scores">
                          <span>{homeScores[0]}</span>
                          <span>{homeScores[1]}</span>
                          <span>{homeScores[2]}</span>
                          <span>{homeScores[3]}</span>
                        </div>
                      </div>
                      <span className="team-score">{game.scores.home.points}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No games available for the selected date</p>
            )}
          </div>
          <button className="arrow-button right-arrow" onClick={handleNextDay}>
            &#8594;
          </button>
        </div>

        {/* News Section */}
        <div className="news-section">
          <h2>NBA Latest News</h2>
          {newsArticles.length > 0 ? (
            newsArticles.map((article) => (
              <div key={article.id || article.title} className="news-card">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-title">
                  <h3>{article.title}</h3>
                </a>
                <p className="news-source">{article.source}</p>
              </div>
            ))
          ) : (
            <p className="no-articles-message">No articles available</p>
          )}
        </div>
      </div>
    </>
  );
};

export default NBAHome;
