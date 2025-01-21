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
  const { session } = useAuth(); // Use session from AuthProvider
  const navigate = useNavigate();

  // Utility to check if a game is live
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

  // Fetch Live Games
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
    fetchNBANews();
    fetchLiveGames(currentDate);
    fetchInteractions();
  }, [currentDate]);

  const handleCommentSubmit = async (articleId, content) => {
    if (!session?.user?.id) {
      setShowLoginModal(true);
      return;
    }
    try {
      await supabase
        .from("comments")
        .insert({ article_id: articleId, user_id: session.user.id, content });
      fetchInteractions(); // Refresh comments
    } catch (err) {
      console.error("Failed to submit comment:", err.message);
    }
  };

  const handleLike = async (articleId) => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    try {
      // Check if the like already exists
      const { data: existingLike } = await supabase
        .from("likes")
        .select("*")
        .eq("article_id", articleId)
        .eq("user_id", session.user.id);

      if (existingLike?.length > 0) {
        console.log("Already liked");
        return;
      }

      await supabase
        .from("likes")
        .insert({ article_id: articleId, user_id: session.user.id });

      setLikes((prev) => ({
        ...prev,
        [articleId]: (prev[articleId] || 0) + 1,
      }));
    } catch (err) {
      console.error("Failed to like article:", err.message);
    }
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

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      <NBAHeader />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Please Log In</h3>
            <p>You need to log in to like or comment on articles.</p>
            <button onClick={() => navigate("/user/signin")}>Log In</button>
            <button onClick={() => navigate("/user/signup")}>Sign Up</button>
            <button onClick={() => setShowLoginModal(false)}>Cancel</button>
          </div>
        </div>
      )}

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
