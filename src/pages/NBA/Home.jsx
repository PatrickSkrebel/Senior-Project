import React, { useEffect, useState } from "react";
import NBAHeader from "../../components/nbaHeader";
import axios from "axios";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../providers/AuthProvider";
import "../../css/nbaHome.css";
import { useNavigate } from "react-router-dom";

const NBAHome = () => {
  const [liveGames, setLiveGames] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newsArticles, setNewsArticles] = useState([]);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  const isGameLive = (game) => {
    const currentTime = new Date();
    const gameStartTime = new Date(game.date.start);
    const gameDurationInHours = 2.5;
    const gameEndTime = new Date(gameStartTime.getTime() + gameDurationInHours * 60 * 60 * 1000);
    return currentTime >= gameStartTime && currentTime <= gameEndTime;
  };

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


  

  const fetchLiveGames = async (date) => {
    setLoading(true);
    setError("");
    try {
      const formattedDate = date.toISOString().split("T")[0];
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

      const gamesForSelectedDate = response.data.response.filter((game) => {
        const gameDateUTC = new Date(game.date.start);
        const gameDateLocal = new Date(
          gameDateUTC.getTime() + gameDateUTC.getTimezoneOffset() * 60000
        );

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

  // Fetch Comments and Likes from Supabase

  const fetchInteractions = async () => {
    try {
      const { data: commentsData } = await supabase.from("comments").select("*");
      const { data: likesData } = await supabase.from("likes").select("*");

      const organizedComments = commentsData.reduce((acc, comment) => {
        if (!acc[comment.article_id]) acc[comment.article_id] = [];
        acc[comment.article_id].push(comment);
        return acc;
      }, {});

      const organizedLikes = likesData.reduce((acc, like) => {
        acc[like.article_id] = (acc[like.article_id] || 0) + 1;
        return acc;
      }, {});

      setComments(organizedComments);
      setLikes(organizedLikes);
    } catch (err) {
      console.error("Failed to fetch interactions:", err.message);
    }
  };



  useEffect(() => {
    fetchLiveGames(currentDate);
    fetchNBANews();
    fetchInteractions();
    const interval = setInterval(() => fetchLiveGames(currentDate), 300000);
    return () => clearInterval(interval);

  }, [currentDate]);

  
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

  const formatGameDate = (dateString) => {
    const date = new Date(dateString);
    
    // Options for formatting: Weekday, Month, Day, and Time
    return date.toLocaleString("en-US", {
      month: "short",  // e.g., Jan
      day: "numeric",  // e.g., 24
      hour: "numeric", // e.g., 7 PM
      minute: "2-digit", // e.g., 07
    });
  };

  return (
    <div>
      <NBAHeader />

      <div className="live-games-wrapper">
        <button className="arrow-button left-arrow" onClick={handlePreviousDay}>
          &#8592;
        </button>
        <div className="live-games-row">
          {liveGames.map((game) => (
            
            <div key={game.id} className="game-card-horizontal">              
              {/* Blinking red light for live games next to the score */}
              <div className="game-status">
                {isGameLive(game) && <div className="blinking-red-light"></div>}
                <div className="game-time">
                  <p>{formatGameDate(game.date.start)}</p>
                </div>
              </div>

              {/* Visitor Team */}
              <div className="team-row-horizontal">
                <img
                  src={game.teams.visitors.logo}
                  alt={game.teams.visitors.nickname}
                  className="team-logo"
                />
                <span className="team-abbreviation">{game.teams.visitors.code}</span>
                <div className="team-quarters">
                  <span>
                      {game.scores.visitors.linescore[0] || " 0"} |
                      {game.scores.visitors.linescore[1] || " 0"} |
                      {game.scores.visitors.linescore[2] || " 0"} | 
                      {game.scores.visitors.linescore[3] || " 0"}
                  </span> 
                </div>

                <span className="team-score">{game.scores.visitors.points}</span>

              </div>

              {/* Home Team */}
              <div className="team-row-horizontal">
                <img
                  src={game.teams.home.logo}
                  alt={game.teams.home.nickname}
                  className="team-logo"
                />
                <span className="team-abbreviation">{game.teams.home.code}</span>
                <div className="team-quarters">
                  <span>
                    {game.scores.home.linescore[0] || " 0"} |
                    {game.scores.home.linescore[1] || " 0"} |
                    {game.scores.home.linescore[2] || " 0"} | 
                    {game.scores.home.linescore[3] || " 0"}
                  </span>                                   
                </div>
                <span className="team-score">{game.scores.home.points}</span>               
              </div>
            </div>
          ))}
        </div>
        <button className="arrow-button right-arrow" onClick={handleNextDay}>
          &#8594;
        </button>
      </div>

      <div className="news-section">
        <h2>NBA Latest News</h2>
        {newsArticles.length > 0 ? (
          newsArticles.map((article) => (
            <div key={article.id || article.title} className="news-card">
              <h3>{article.title}</h3>
              <p className="news-source">{article.source}</p>
              <button onClick={() => handleLike(article.id)}>
                Like ({likes[article.id] || 0})
              </button>
              <div className="comments-section">
                <h4>Comments:</h4>
                {comments[article.id]?.map((comment) => (
                  <p key={comment.id}>{comment.content}</p>
                ))}
                <textarea
                  placeholder="Add a comment..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCommentSubmit(article.id, e.target.value);
                      e.target.value = "";
                    }
                  }}
                ></textarea>
              </div>
            </div>
          ))
        ) : (
          <p>No articles available</p>
        )}
      </div>
    </div>
  );
};

export default NBAHome;
