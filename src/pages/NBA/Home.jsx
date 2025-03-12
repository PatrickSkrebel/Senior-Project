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
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add a loading state
  const [submitError, setSubmitError] = useState(""); // Add an error state
  const [submitSuccess, setSubmitSuccess] = useState(false); // Add a success state

  const handleGameClick = (gameId) => {
    navigate(`/nba/boxscore/${gameId}`);
  };

  const toggleArticle = (articleId) => {
    setExpandedArticleId((prevId) => (prevId === articleId ? null : articleId));
  };

  const generateArticleId = (article) => {
    return article.url || article.id || article.title;
  };

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
      const { data: profilesData } = await supabase.from("profiles").select("id, username");

      const profilesMap = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile.username;
        return acc;
      }, {});

      const organizedComments = commentsData.reduce((acc, comment) => {
        const articleId = comment.article_id;
        if (!acc[articleId]) acc[articleId] = [];
        acc[articleId].push({
          ...comment,
          username: profilesMap[comment.user_id] || "Anonymous",
        });
        return acc;
      }, {});

      setComments(organizedComments);
    } catch (err) {
      console.error("Failed to fetch interactions:", err.message);
    }
  };

  const handleCommentSubmit = async (articleId, content) => {
    if (!session) {
      alert("You must be signed in to comment.");
      return;
    }

    if (!articleId) {
      console.error("❌ Missing article ID, comment not saved!");
      return;
    }

    setIsSubmitting(true); // Start loading
    setSubmitError(""); // Clear any previous errors
    setSubmitSuccess(false); // Clear any previous success messages

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            article_id: articleId,
            user_id: session.user.id,
            content: content,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      console.log("✅ Comment added successfully:", data);

      await fetchInteractions(); // Refresh comments
      setSubmitSuccess(true); // Show success message
      setTimeout(() => setSubmitSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      console.error("❌ Failed to submit comment:", err.message);
      setSubmitError("Failed to submit comment. Please try again."); // Show error message
    } finally {
      setIsSubmitting(false); // Stop loading
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
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <NBAHeader />

      <div className="live-g-wrapper">
  <button
    className="live-g-arrow-button live-g-left-arrow"
    onClick={handlePreviousDay}
  >
    &#8592;
  </button>
  <div className="live-g-row">
    {liveGames.map((game) => (
      <div
        key={game.id}
        className="live-g-card-horizontal"
        onClick={() => handleGameClick(game.id)}
      >
        <div className="live-g-game-status">
          {isGameLive(game) && (
            <div className="live-g-blinking-red-light"></div>
          )}
          <div className="live-g-game-time">
            <p>{formatGameDate(game.date.start)}</p>
          </div>
        </div>

        {/* Visitor Team */}
        <div className="live-g-team-row">
          <img
            src={game.teams.visitors.logo}
            alt={game.teams.visitors.nickname}
            className="live-g-team-logo"
          />
          <span className="live-g-team-abbreviation">
            {game.teams.visitors.code}
          </span>
          <div className="live-g-team-quarters">
            <span>
              {game.scores.visitors.linescore[0] || "0"} |
              {game.scores.visitors.linescore[1] || "0"} |
              {game.scores.visitors.linescore[2] || "0"} |
              {game.scores.visitors.linescore[3] || "0"}
            </span>
          </div>
          <span className="live-g-team-score">
            {game.scores.visitors.points}
          </span>
        </div>

        {/* Home Team */}
        <div className="live-g-team-row">
          <img
            src={game.teams.home.logo}
            alt={game.teams.home.nickname}
            className="live-g-team-logo"
          />
          <span className="live-g-team-abbreviation">
            {game.teams.home.code}
          </span>
          <div className="live-g-team-quarters">
            <span>
              {game.scores.home.linescore[0] || "0"} |
              {game.scores.home.linescore[1] || "0"} |
              {game.scores.home.linescore[2] || "0"} |
              {game.scores.home.linescore[3] || "0"}
            </span>
          </div>
          <span className="live-g-team-score">
            {game.scores.home.points}
          </span>
        </div>

        {/* Hover Text */}
        <div className="live-g-hover-boxscore-text">Boxscore</div>
      </div>
    ))}
  </div>
  <button
    className="live-g-arrow-button live-g-right-arrow"
    onClick={handleNextDay}
  >
    &#8594;
  </button>
</div>

      <div className="news-section">
      <h2>NBA Latest News</h2>
      
      {newsArticles.length > 0 ? (
        newsArticles.map((article) => {
          const articleId = generateArticleId(article);
          const articleComments = comments[articleId] || [];

          return (
            <div key={articleId} className="news-card">
              {/* Article Title as a Link */}
              <a
                href={article.url || `https://example.com/article/${article.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="article-link"
              >
                <h3>{article.title}</h3>
              </a>
              <p className="news-source">{article.source}</p>

              {/* Comment Section */}
              <div className="comments-section">
                <h4>Comments:</h4>

                {articleComments.length > 0 ? (
                  articleComments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <div className="user">
                        {/* User Avatar */}
                        <div className="user-pic">
                          <svg fill="none" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linejoin="round" fill="#707277" stroke-linecap="round" stroke-width="2" stroke="#707277" d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z"></path>
                            <path stroke-width="2" fill="#707277" stroke="#707277" d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"></path>
                          </svg>
                        </div>

                        {/* User Info and Comment */}
                        <div className="user-info">
                          <span>{comment.username}</span>
                          <p>{new Date(comment.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-comments-message">No comments yet. Be the first to comment!</p>
                )}

                {/* Comment Input */}
                {session && (
                  <div className="comment-input">
                    <textarea
                      placeholder="Add a comment..."
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && e.target.value.trim() && !isSubmitting) {
                          e.preventDefault();
                          await handleCommentSubmit(articleId, e.target.value);
                          e.target.value = ""; // Clear input
                        }
                      }}
                      disabled={isSubmitting} // Disable textarea while submitting
                    ></textarea>
                    <button
                      onClick={async () => {
                        const textarea = document.querySelector(".comment-input textarea");
                        if (textarea.value.trim() && !isSubmitting) {
                          await handleCommentSubmit(articleId, textarea.value);
                          textarea.value = ""; // Clear input
                        }
                      }}
                      disabled={isSubmitting} // Disable button while submitting
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </button>

                    {/* Feedback Messages */}
                    {submitError && <p className="error-message">{submitError}</p>}
                    {submitSuccess && <p className="success-message">Comment submitted successfully!</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p>No articles available</p>
      )}
      </div>
    </div>
  );
};

export default NBAHome;